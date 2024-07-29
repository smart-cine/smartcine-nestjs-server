import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginAccount } from './dto/LoginAccount.dto';
import { RegisterAccount } from './dto/RegisterAccount.dto';
import { genId } from 'src/shared/genId';
import { hash } from 'src/utils/hash';

@Injectable()
export class AccountService {
  constructor(private prismaService: PrismaService) {}

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
    if (account.password === (await hash(data.password))) {
      return {
        account,
      };
    }

    throw new UnauthorizedException();
  }
}
