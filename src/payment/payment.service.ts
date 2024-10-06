import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/CreatePayment.dto';
import { TAccountRequest } from 'src/account/decorators/AccountRequest.decorator';
import { PrismaService } from 'src/prisma/prisma.service';
import * as moment from 'moment';
import { PaymentStatus } from '@prisma/client';
import { genId } from 'src/shared/genId';
import { binaryToUuid } from 'src/utils/uuid';
import { VNPAYDto } from './dto/VNPAY.dto';
import { validate, validateOrReject } from 'class-validator';
import { plainToClass, plainToInstance } from 'class-transformer';
import { VNPAYWalletService } from './wallet/vnpay-wallet.service';

@Injectable()
export class PaymentService {
  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService,
    private vnpayWalletService: VNPAYWalletService,
  ) {}

  async createItem(
    body: CreatePaymentDto,
    account: TAccountRequest,
    ip: string,
  ) {
    const perform = await this.prismaService.perform.findUnique({
      where: {
        id: body.perform_id,
      },
      select: {
        room: {
          select: {
            cinema: {
              select: {
                banks: {
                  select: {
                    business_bank_id: true,
                    bank: {
                      select: {
                        data: true,
                      },
                    },
                  },
                  where: {
                    type: body.type,
                  },
                },
              },
            },
          },
        },
        price: true,
      },
    });
    console.log(perform);
    if (!perform?.room.cinema.banks[0]) {
      throw new Error('Bank not found');
    }

    const items = await this.prismaService.item.findMany({
      where: {
        id: {
          in: body.items.map((item) => item.id),
        },
      },
      select: {
        price: true,
      }
    });

    const business_bank_id = perform.room.cinema.banks[0].business_bank_id;
    const data = perform.room.cinema.banks[0].bank.data;
    const validated = plainToInstance(VNPAYDto, data);
    await validateOrReject(validated);

    const id = genId();
    const amount = perform.price.toNumber() + items.reduce((acc, item) => acc + item.price.toNumber(), 0);
    console.log("Am,ount", amount, items.reduce((acc, item) => acc + item.price.toNumber(), 0));

    await this.prismaService.payment.createMany({
      data: {
        id: id,
        account_id: account.id,
        perform_id: body.perform_id,
        business_bank_id: business_bank_id,
        type: body.type,
        data: validated as any,
        date_expired: moment().add(15, 'minutes').toDate(),
        status: PaymentStatus.PENDING,
      },
    });

    return this.vnpayWalletService.createPayment({
      id: id,
      ip: ip,
      amount: amount,
      data: validated,
    });
  }
}
