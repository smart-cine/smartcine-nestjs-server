import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '../decorators/roles.decorator';
import { TCustomRequest } from '../types/TCustomRequest';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles =
      this.reflector.get(Roles, context.getHandler()) ??
      this.reflector.get(Roles, context.getClass()) ??
      [];

    if (roles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<TCustomRequest>();

    if (request.account?.role && !roles.includes(request.account.role)) {
      throw new UnauthorizedException(
        "You don't have permission to access this resource",
      );
    }
    return true;
  }
}
