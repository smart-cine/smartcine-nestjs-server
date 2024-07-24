import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginAccount } from './dto/LoginAccount.dto';
import { RegisterAccount } from './dto/RegisterAccount.dto';
import { genId } from 'src/shared/genId';
import { md5 } from 'src/utils/md5';

@Injectable()
export class AccountService {
  constructor(private prismaService: PrismaService) {}

  async register(data: RegisterAccount) {
    return this.prismaService.account.create({
      data: {
        id: genId(),
        email: data.email,
        password: md5(data.password),
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
    if (account.password === md5(data.password)) {
      return {
        account,
      };
    }

    throw new UnauthorizedException();
  }
}
