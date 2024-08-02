import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { SessionAccount } from '../dto/SessionAccount.dto';

export const Account = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<
      Request & {
        account: SessionAccount;
      }
    >();
    if (!request.account) {
      throw new Error('No credentials found');
    }
    return request.account;
  },
);
