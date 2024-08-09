import { Request } from 'express';
import { TAccountRequest } from '../decorators/AccountRequest.decorator';
import { TCinemaProviderRequest } from '../decorators/CinemaProviderRequest.decorator';

export type TCustomRequest = Request & {
  account: TAccountRequest;
  cinema_provider: TCinemaProviderRequest;
};
