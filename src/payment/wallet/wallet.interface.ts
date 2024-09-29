import { HashAlgorithm } from '../enum/HashAlgorithm.enum';

export type TPaymentInfo<T> = {
  id: Buffer;
  ip: string;
  amount: number;
  data: T;
};

export type WalletInterface<T> = {
  createPayment: (data: TPaymentInfo<T>) => Promise<string>;
  verifyPayment: (data: any) => Promise<void>;

  calculateSecureHash: (
    data: string,
    secureSecret: string,
    hashAlgorithm?: HashAlgorithm,
  ) => string;

  verifySecureHash: (
    data: string,
    secureSecret: string,
    receivedHash: string,
    hashAlgorithm?: HashAlgorithm,
  ) => boolean;
};
