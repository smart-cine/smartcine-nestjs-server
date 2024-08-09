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
import { RedisService } from 'src/redis/redis.service';
import { plainToInstance } from 'class-transformer';
import { SessionAccount } from '../dto/SessionAccount.dto';
import { Roles } from '../decorators/roles.decorator';
import { AccountRole, CinemaProviderPermission } from '@prisma/client';
import { Permissions } from '../decorators/permissions.decorator';
import { TAccountRequest } from '../decorators/AccountRequest.decorator';
import { TCustomRequest } from '../types/TCustomRequest';

@Injectable()
export class JwtParserGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permission =
      this.reflector.get<CinemaProviderPermission>(
        Permissions,
        context.getHandler(),
      ) ??
      this.reflector.get<CinemaProviderPermission>(
        Permissions,
        context.getClass(),
      );
    const roles =
      this.reflector.get<AccountRole>(Roles, context.getHandler()) ??
      this.reflector.get<AccountRole>(Roles, context.getClass()) ??
      [];

    if (!permission && roles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<TCustomRequest>();

    try {
      const token = this.extractTokenFromHeader(request);
      if (!token?.length) {
        return true;
      }
      const payload = await this.jwtService.verifyAsync(token);
      const dto = plainToInstance(SessionAccount, payload);
      await validateOrReject(dto);

      // const isBlacklisted = await this.redisService.isBlacklisted(token);
      // if (isBlacklisted) {
      //   console.log('blacklisted!');
      //   throw new UnauthorizedException('Invalid token');
      // }

      request.account = dto;
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
