import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permissions } from '../decorators/permissions.decorator';
import { PrismaService } from 'src/prisma/prisma.service';
import { CinemaProviderPermission } from '@prisma/client';
import { TCustomRequest } from '../types/TCustomRequest';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prismaService: PrismaService,
  ) {}

  permToScore = {
    [CinemaProviderPermission.ADMIN]: 0,
    [CinemaProviderPermission.MANAGER]: 1,
    [CinemaProviderPermission.STAFF]: 2,
  };

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requirePermission =
      this.reflector.get(Permissions, context.getHandler()) ??
      this.reflector.get(Permissions, context.getClass());

    if (!requirePermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest<TCustomRequest>();

    const query = await this.prismaService.businessAccount.findUniqueOrThrow({
      where: {
        id: request.account.id,
      },
      select: {
        cinema_provider: {
          select: {
            cinema_provider_id: true,
            permission: true,
          },
        },
      },
    });

    const { cinema_provider_id, permission } = query?.cinema_provider || {};

    request.cinema_provider = {
      cinema_provider_id,
      permission,
    };

    if (typeof requirePermission === 'object') {
      // Check if requirePermission is "{}" (which means no permission is required but need the "cinema_provider" object)
      return true;
    }

    if (!cinema_provider_id || !permission) {
      throw new UnauthorizedException(
        "You don't have permission to access this resource",
      );
    }

    if (this.permToScore[permission] > this.permToScore[requirePermission]) {
      throw new UnauthorizedException(
        "You don't have permission to access this resource",
      );
    }

    return true;
  }
}
