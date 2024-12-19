import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TCustomRequest } from '../types/TCustomRequest';
import { AccountRole } from '@prisma/client';

export const AccountRequest = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<TCustomRequest>();
    if (!request?.account) {
      throw new Error(
        'No account credentials found, make sure you put the "@Roles([...])" decorator on the route',
      );
    }
    return request.account;
  },
);

export type TAccountRequest = {
  id: Buffer;
  role: AccountRole;
};
