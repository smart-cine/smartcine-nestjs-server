import { Request } from 'express';
import { TAccountRequest } from '../decorators/AccountRequest.decorator';
import { BusinessRole } from '@prisma/client';

export type TCustomRequest = Request & {
  account?: TAccountRequest;
};
