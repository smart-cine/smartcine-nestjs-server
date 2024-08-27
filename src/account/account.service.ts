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
import { ClientError } from 'src/response/error/ClientError';
import { ErrorKey } from 'src/response/constants/error-key';
import { TAccountRequest } from './decorators/AccountRequest.decorator';
import { BusinessRole } from '@prisma/client';

@Injectable()
export class AccountService {
  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService,
    private redisService: RedisService,
    private jwtService: JwtService,
  ) {}

  async generateToken(payload: TAccountRequest) {
    return await this.jwtService.signAsync({
      id: binaryToUuid(payload.id),
      role: payload.role,
    });
  }

  async register(data: RegisterAccount) {
    const account = await this.prismaService.account.create({
      data: {
        id: genId(),
        email: data.email,
        password: await hash(data.password),
        role: data.role,
        name: data.name,
      },
      select: {
        id: true,
        role: true,
        email: true,
        name: true,
      },
    });
    return {
      email: account.email,
      role: account.role,
      name: account.name,
      token: await this.generateToken({
        id: account.id,
        role: account.role,
      }),
    };
  }

  async login(body: LoginAccount) {
    const account = await this.prismaService.account.findFirst({
      where: {
        email: body.email,
      },
      include: {
        business_account: {
          select: {
            ownership: {
              select: {
                item_id: true,
                role: true,
              },
            },
          },
        },
      },
    });
    if (!account) {
      throw new ClientError('Email not found!', ErrorKey.EMAIL_NOT_FOUND);
    }

    if (await bcrypt.compare(body.password, account.password)) {
      const providerRoles: BusinessRole[] = [
        BusinessRole.PROVIDER_ADMIN,
        BusinessRole.PROVIDER_MANAGER,
      ];
      const cinemaRoles: BusinessRole[] = [
        BusinessRole.CINEMA_ADMIN,
        BusinessRole.CINEMA_MANAGER,
        BusinessRole.CINEMA_STAFF,
      ];

      let ownerships: {
        cinema_provider?: {
          id: string;
          role: string;
        } | null;
        cinema?: {
          id: string;
          role: string;
        } | null;
      } = {
        cinema_provider: null,
        cinema: null,
      };

      if (account.business_account?.ownership) {
        // Check if the account manages a provider
        if (providerRoles.includes(account.business_account.ownership.role)) {
          ownerships.cinema_provider = {
            id: binaryToUuid(account.business_account.ownership.item_id),
            role: account.business_account.ownership.role,
          };
        }

        // Check if the account manages a cinema
        if (cinemaRoles.includes(account.business_account.ownership.role)) {
          ownerships.cinema = {
            id: binaryToUuid(account.business_account.ownership.item_id),
            role: account.business_account.ownership.role,
          };
        }
      }

      return {
        email: account.email,
        role: account.role,
        name: account.name,
        ...ownerships,
        token: await this.generateToken({
          id: account.id,
          role: account.role,
        }),
      };
    }

    throw new ClientError(
      'Password is incorrect!',
      ErrorKey.PASSWORD_NOT_MATCH,
    );
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
