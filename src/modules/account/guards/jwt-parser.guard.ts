import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { validateOrReject } from 'class-validator';
import { Request } from 'express';
import { RedisService } from 'src/common/redis/redis.service';
import { plainToInstance } from 'class-transformer';
import { JwtPayloadDto } from '../dto/JwtPayload.dto';
import { Roles } from '../decorators/roles.decorator';
import { AccountRole } from '@prisma/client';
import { TCustomRequest } from '../types/TCustomRequest';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class JwtParserGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles =
      this.reflector.get<AccountRole>(Roles, context.getHandler()) ??
      this.reflector.get<AccountRole>(Roles, context.getClass()) ??
      [];

    if (roles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<TCustomRequest>();

    try {
      const token = this.extractTokenFromHeader(request);
      if (!token?.length) {
        return true;
      }
      const payload = await this.jwtService.verifyAsync(token);
      const payloadValidate = plainToInstance(JwtPayloadDto, payload);
      await validateOrReject(payloadValidate);
      if (payloadValidate.role === AccountRole.BUSINESS) {
        await this.prismaService.businessAccount.findUniqueOrThrow({
          where: {
            id: payloadValidate.id,
          },
          select: {
            id: true,
          },
        });
      } else if (payloadValidate.role === AccountRole.USER) {
        await this.prismaService.userAccount.findUniqueOrThrow({
          where: {
            id: payloadValidate.id,
          },
          select: {
            id: true,
          },
        });
      }

      // const isBlacklisted = await this.redisService.isBlacklisted(token);
      // if (isBlacklisted) {
      //   console.log('blacklisted!');
      //   throw new UnauthorizedException('Invalid token');
      // }

      request.account = payloadValidate;
    } catch (error: any) {
      throw new UnauthorizedException(error?.message);
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
