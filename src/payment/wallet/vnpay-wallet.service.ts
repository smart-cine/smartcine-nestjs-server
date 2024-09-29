import { Injectable } from '@nestjs/common';
import { HashAlgorithm } from '../enum/HashAlgorithm.enum';
import { hash } from 'src/utils/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { genId } from 'src/shared/genId';
import { TPaymentInfo, WalletInterface } from './wallet.interface';
import { VNPAYDto } from '../dto/VNPAY.dto';
import * as moment from 'moment';
import { binaryToUuid, uuidToBinary } from 'src/utils/uuid';
import { VNPAYIPNDto } from '../dto/VNPAY-IPN.dto';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { PaymentStatus } from '@prisma/client';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class VNPAYWalletService implements WalletInterface<VNPAYDto> {
  constructor(
    private configService: ConfigService,
    private redisService: RedisService,
    private prismaService: PrismaService,
  ) {}

  async createPayment(info: TPaymentInfo<VNPAYDto>): Promise<string> {
    // https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html
    const params = new URLSearchParams();
    const vnp_Url = this.configService.get('VNPAY_URL');
    const vnp_Version = this.configService.get('VNPAY_VERSION');
    const vnp_CurrCode = this.configService.get('VNPAY_CURRCODE');

    if (!vnp_Version || !vnp_CurrCode || !vnp_Url) {
      throw new Error('VNPAY_VERSION or VNPAY_CURRCODE not found');
    }

    // params.append('vnp_version', vnp_Version);
    // params.append('vnp_command', 'pay');
    // params.append('vnp_tmn_code', vnp_TmnCode);
    // params.append('vnp_app_user_id', ''); //
    // params.append('vnp_bank_code', 'VISA');
    // params.append('vnp_locale', 'en');
    // params.append('vnp_card_type', '01');
    // params.append('vnp_txn_ref', binaryToUuid(id));
    // params.append('vnp_order_info', 'Thanh toan hoa don');
    // params.append('vnp_txn_desc', 'Thanh toan hoa don');
    // params.append('vnp_return_url', 'http://localhost:3000');
    // params.append('vnp_cancel_url', 'http://localhost:3000');
    // params.append('vnp_ip_addr', info.ip);
    // params.append('vnp_create_date', moment.utc().format('yyyyMMddHHmmss'));
    // params.append('vnp_secure_hash', vnp_SecureHash);

    params.append('vnp_Amount', String(info.amount * 100));
    params.append('vnp_Command', 'pay');
    params.append('vnp_CreateDate', moment().format('YYYYMMDDHHmmss'));
    params.append('vnp_CurrCode', vnp_CurrCode);
    params.append(
      'vnp_ExpireDate',
      moment().add(15, 'minutes').format('YYYYMMDDHHmmss'),
    );
    params.append('vnp_IpAddr', '123.123.123.123');
    params.append('vnp_Locale', 'en');
    params.append('vnp_OrderInfo', 'Thanh toan hoa don');
    params.append('vnp_OrderType', 'other');
    params.append('vnp_ReturnUrl', 'http://localhost:3000');
    params.append('vnp_TmnCode', '15TGSMDP');
    params.append('vnp_TxnRef', binaryToUuid(info.id));
    params.append('vnp_Version', vnp_Version);
    params.sort();

    params.append(
      'vnp_SecureHash',
      this.calculateSecureHash(
        params.toString(),
        'S337652W2K5IU1VTPQBJGK0Z387075FV',
      ),
    );

    // await fetch('https://sandbox.vnpayment.vn/paymentv2/vpcpay.html');
    return `${vnp_Url}?${params.toString()}`;
  }

  async verifyPayment(query: VNPAYIPNDto): Promise<void> {
    const payment = await this.prismaService.payment.findUniqueOrThrow({
      where: {
        id: uuidToBinary(query.vnp_TxnRef),
      },
      select: {
        type: true,
        status: true,
        business_bank: {
          select: {
            data: true,
          },
        },
      },
    });
    const bank = plainToInstance(VNPAYDto, payment.business_bank.data);
    await validateOrReject(bank);

    const params = new URLSearchParams(
      query as unknown as Record<string, string>,
    );
    params.delete('vnp_SecureHash');
    params.sort();
    const isValid = this.verifySecureHash(
      params.toString(),
      'S337652W2K5IU1VTPQBJGK0Z387075FV', // bank.vnp_SecureHash // TODO: doi vnp_SecureHash thanh vnp_SecureSecret
      query.vnp_SecureHash,
    );
    if (!isValid) {
      throw new Error('Invalid signature');
    }
  }

  calculateSecureHash(
    data: string,
    secureSecret: string,
    hashAlgorithm: HashAlgorithm = HashAlgorithm.SHA512,
  ): string {
    return hash(secureSecret, Buffer.from(data, 'utf-8'), hashAlgorithm);
  }

  verifySecureHash(
    data: string,
    secureSecret: string,
    receivedHash: string,
    hashAlgorithm?: HashAlgorithm,
  ): boolean {
    const calculatedHash = this.calculateSecureHash(
      data,
      secureSecret,
      hashAlgorithm,
    );
    return calculatedHash === receivedHash;
  }

  async handleIPN(query: VNPAYIPNDto): Promise<void> {
    await this.verifyPayment(query);

    await this.prismaService.$transaction(async (tx) => {
      const { perform_id, account_id } = await tx.payment.update({
        where: {
          id: uuidToBinary(query.vnp_TxnRef),
        },
        data: {
          status:
            query.vnp_ResponseCode === '00'
              ? PaymentStatus.SUCCESS
              : PaymentStatus.FAILED,
        },
        select: {
          perform_id: true,
          account_id: true,
        },
      });

      const seats = await this.redisService.sendCommand<string[]>([
        'SMEMBERS',
        `pickseat:${binaryToUuid(perform_id)}:${binaryToUuid(account_id)}`,
      ]);

      await this.redisService.sendCommand([
        'DEL',
        `pickseat:${binaryToUuid(perform_id)}:${binaryToUuid(account_id)}`,
      ]);

      await this.prismaService.pickseat.createMany({
        data: seats.map((id) => ({
          id: genId(),
          layout_seat_id: uuidToBinary(id),
          perform_id,
          account_id,
        })),
      });
    });
  }

  // async verifyPayment(query: VNPAYIPNDto): Promise<boolean> {
  //   const queryStr = new URLSearchParams(
  //     query as unknown as Record<string, string>,
  //   ).toString();

  //   this.prismaService.payment.update({
  //     where: {
  //       id: uuidToBinary(query.vnp_TxnRef),
  //     },
  //     data: {
  //       status: query. === '00' ? 'SUCCESS' : 'FAILED',
  //     },
  //   });

  //   this.verifySecureHash(
  //     queryStr,
  //     'S337652W2K5IU1VTPQBJGK0Z387075FV',
  //     query.vnp_SecureHash,
  //   );
  // }
}
