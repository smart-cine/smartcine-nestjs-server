import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/CreatePayment.dto';
import { TAccountRequest } from 'src/account/decorators/AccountRequest.decorator';
import { PrismaService } from 'src/prisma/prisma.service';
import moment from 'moment';
import { PaymentStatus } from '@prisma/client';
import { genId } from 'src/shared/genId';
import { binaryToUuid } from 'src/utils/uuid';

type Bill = {
  ip: string;
  amount: number;
};

@Injectable()
export class PaymentService {
  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService,
  ) {}

  async createVnpayPayment(bill: Bill) {
    // https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html
    const params = new URLSearchParams();
    const vnp_Version = this.configService.get('VNPAY_VERSION');
    const vnp_CurrCode = this.configService.get('VNPAY_CURRCODE');
    const vnp_TmnCode = this.configService.get('VNPAY_TMNCODE');
    const vnp_SecureHash = this.configService.get('VNPAY_SECUREHASH');

    if (!vnp_Version || !vnp_CurrCode || !vnp_TmnCode) {
      throw new Error('VNPAY_VERSION or VNPAY_CURRCODE not found');
    }

    const id = genId();

    params.append('vnp_Version', vnp_Version);
    params.append('vnp_Command', 'pay');
    params.append('vnp_TmnCode', vnp_TmnCode);
    params.append('vnp_Amount', String(bill.amount * 100));
    params.append('vnp_CurrCode', vnp_CurrCode);
    params.append('vnp_IpAddr', bill.ip);
    params.append('vnp_Locale', 'en');
    params.append('vnp_OrderInfo', 'Thanh toan hoa don');
    params.append('vnp_OrderType', 'billpayment');
    params.append('vnp_ReturnUrl', 'http://localhost:3000');
    params.append(
      'vnp_ExpireDate',
      moment.utc().add(15, 'minute').format('yyyyMMddHHmmss'),
    );
    params.append('vnp_TxnRef', binaryToUuid(id));
    params.append('vnp_SecureHash', vnp_SecureHash);

    await fetch('https://sandbox.vnpayment.vn/paymentv2/vpcpay.html');
  }

  async createItem(body: CreatePaymentDto, account: TAccountRequest) {
    const query = await this.prismaService.perform.findUnique({
      where: {
        id: body.perform_id,
      },
      select: {
        room: {
          select: {
            cinema: {
              select: {
                banks: {
                  where: {
                    type: body.type,
                  },
                },
              },
            },
          },
        },
      },
    });
    const business_bank_id = query?.room.cinema.banks[0].business_bank_id;
    if (!business_bank_id) {
      throw new Error('Bank not found');
    }
    const data = {};

    await this.prismaService.payment.createMany({
      data: {
        id: genId(),
        account_id: account.id,
        perform_id: body.perform_id,
        business_bank_id: business_bank_id,
        type: body.type,
        data: data,
        date_expired: moment().add(1, 'days').toDate(),
        status: PaymentStatus.PENDING,
      },
    });
  }
}
