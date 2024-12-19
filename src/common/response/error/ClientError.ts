import { ErrorKey } from '../constants/error-key';

export class ClientError extends Error {
  error_key: ErrorKey;
  constructor(message: string, error_key: ErrorKey = ErrorKey.INTERNAL) {
    super(message);
    this.error_key = error_key;
  }
}
