import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Feature } from '../decorators/feature.decorator';
import { TCustomRequest } from '../types/TCustomRequest';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const feature =
      this.reflector.get(Feature, context.getHandler()) ??
      this.reflector.get(Feature, context.getClass());

    if (!feature) {
      return true;
    }

    const request = context.switchToHttp().getRequest<TCustomRequest>();
    if (!request.account) {
      throw new UnauthorizedException('Permission denied');
    }

    try {
      const ownership = await this.prismaService.ownership.findUniqueOrThrow({
        where: {
          owner_id: request.account.id,
        },
        select: {
          item_id: true,
          role: true,
        },
      });

      console.log(ownership, feature);
      await this.prismaService.roleToFeature.findUniqueOrThrow({
        where: {
          role_feature: {
            role: ownership.role,
            feature: feature,
          },
        },
      });
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Permission denied');
    }

    return true;
  }
}
