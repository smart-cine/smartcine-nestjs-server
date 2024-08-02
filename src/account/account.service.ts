import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginAccount } from './dto/LoginAccount.dto';
import { RegisterAccount } from './dto/RegisterAccount.dto';
import { genId } from 'src/shared/genId';
import { hash } from 'src/utils/hash';
import * as bcrypt from 'bcrypt';
import { binaryToUuid } from 'src/utils/uuid';
import { RedisService } from 'src/redis/redis.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { convertJwtExpireToSeconds } from 'src/utils/common';

@Injectable()
export class AccountService {
  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService,
    private redisService: RedisService,
    private jwtService: JwtService,
  ) {}

  async register(data: RegisterAccount) {
    return this.prismaService.account.create({
      data: {
        id: genId(),
        email: data.email,
        password: await hash(data.password),
        role: data.role,
        name: data.name,
      },
    });
  }

  async login(data: LoginAccount) {
    const account = await this.prismaService.account.findFirst({
      where: {
        email: data.email,
      },
    });
    if (!account) {
      throw new UnauthorizedException();
    }

    if (await bcrypt.compare(data.password, account.password)) {
      const payload = {
        id: binaryToUuid(account.id),
        email: account.email,
        role: account.role,
      };
      const token = await this.jwtService.signAsync(payload);
      return {
        email: account.email,
        role: account.role,
        name: account.name,
        token,
      };
    }

    throw new UnauthorizedException();
  }

  async logout(token: string) {
    await this.jwtService.verifyAsync(token);
    const exists = await this.redisService.sendCommand([
      'EXISTS',
      `blacklist:${token}`,
    ]);
    if (exists === 1) {
      throw new UnauthorizedException();
    }

    await this.redisService.blacklist(token);
    const ttl = convertJwtExpireToSeconds(
      this.configService.get('JWT_EXPIRES_IN')!,
    );
    await this.redisService.sendCommand([
      'EXPIRE',
      `blacklist:${token}`,
      String(ttl),
    ]);
  }
}
