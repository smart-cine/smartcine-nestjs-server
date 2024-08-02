import { binaryToUuid } from 'src/utils/uuid';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { isString, validateOrReject } from 'class-validator';
import { Request } from 'express';
import { Roles } from '../decorators/roles.decorator';
import { RedisService } from 'src/redis/redis.service';
import { plainToInstance } from 'class-transformer';
import { SessionAccount } from '../dto/SessionAccount.dto';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles =
      this.reflector.get(Roles, context.getHandler()) ||
      this.reflector.get(Roles, context.getClass()) ||
      [];
    const request = context
      .switchToHttp()
      .getRequest<Request & { account: SessionAccount }>();

    try {
      if (roles.length) {
        const token = this.extractTokenFromHeader(request);
        if (!token) {
          throw new UnauthorizedException(
            'You must be logged in to access this resource',
          );
        }
        const payload = await this.jwtService.verifyAsync(token);
        const dto = plainToInstance(SessionAccount, payload);
        await validateOrReject(dto);

        // const isBlacklisted = await this.redisService.isBlacklisted(token);
        // if (isBlacklisted) {
        //   console.log('blacklisted!');
        //   throw new UnauthorizedException('Invalid token');
        // }

        if (!roles.includes(dto.role)) {
          throw new UnauthorizedException(
            "You don't have permission to access this resource",
          );
        }

        request.account = dto;
      }
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
