import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { isString, validate } from 'class-validator';
import { Request } from 'express';
import { Roles } from '../decorators/roles.decorator';
import { RedisService } from 'src/redis/redis.service';
import { plainToInstance } from 'class-transformer';
import { SessionDto } from '../dto/Session.dto';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get(Roles, context.getHandler());
    const request = context.switchToHttp().getRequest();

    try {
      if (roles) {
        const sessionId = this.extractSessionIdFromHeader(request);
        const token = await this.redisService.hget(sessionId);
        console.log('token', token);
        const payload = await this.jwtService.verifyAsync(token);
        console.log('payload', payload);
        const dto = plainToInstance(SessionDto, payload);
        await validate(dto);
        if (!roles.includes(dto.role)) {
          throw new UnauthorizedException();
        }
      }
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private extractSessionIdFromHeader(request: Request): string | undefined {
    if (
      request.headers['x-session-id'] &&
      isString(request.headers['x-session-id'])
    ) {
      return request.headers['x-session-id'];
    }

    if (
      request.headers['X-Session-ID'] &&
      isString(request.headers['X-Session-ID'])
    ) {
      return request.headers['X-Session-ID'];
    }
  }
}
