import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CinemaProviderPermission } from '@prisma/client';
import { TCustomRequest } from '../types/TCustomRequest';

export const CinemaProviderRequest = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<TCustomRequest>();
    if (!request?.cinema_provider) {
      throw new Error(
        'No cinema provider found, make sure you put the "@Permissions(...)" or "@Permissions()" on the route',
      );
    }

    return request.cinema_provider;
  },
);

export type TCinemaProviderRequest = {
  cinema_provider_id?: Buffer;
  permission?: CinemaProviderPermission;
};
