import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/CreatePayment.dto';
import { TAccountRequest } from 'src/account/decorators/AccountRequest.decorator';
import { PrismaService } from 'src/prisma/prisma.service';
import * as moment from 'moment';
import { PaymentStatus, Prisma } from '@prisma/client';
import { genId } from 'src/shared/genId';
import { binaryToUuid, uuidToBinary } from 'src/utils/uuid';
import { VNPAYDto } from './dto/VNPAY.dto';
import { validate, validateOrReject } from 'class-validator';
import { plainToClass, plainToInstance } from 'class-transformer';
import { VNPAYWalletService } from './wallet/vnpay-wallet.service';
import { RedisService } from 'src/redis/redis.service'
import { PickseatStatus } from 'src/pickseat/constants/pickseat.constant'



@Injectable()
export class PaymentService {
  constructor(
    private configService: ConfigService,
    private redisService: RedisService,
    private prismaService: PrismaService,
    private vnpayWalletService: VNPAYWalletService,
  ) {}

  async createItem(
    body: CreatePaymentDto,
    account: TAccountRequest,
    ip: string,
  ) {
    const conditions: Prisma.PerformWhereUniqueInput = {
      id: body.perform_id,
      room: {
        cinema: {
          banks: {
            some: {
              type: body.type,
            },
          },
        },
      }
    };
    const perform = await this.prismaService.perform.findUnique({
      where: conditions,
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
                  where: conditions.room?.cinema?.banks?.some,
                },
              },
            },
          },
        },
        price: true,
      },
    });
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
    const validated = plainToInstance(VNPAYDto, data); // Validate data from bank
    await validateOrReject(validated);

    const scan = await this.redisService.sendCommand<[string, string[]]>([
      'SCAN',
      '0',
      'MATCH',
      `pickseat:${binaryToUuid(body.perform_id)}:${binaryToUuid(account.id)}`,
    ]);

    const picking_seats = (
      await Promise.all(
        scan[1].map(async (key) =>
          this.redisService.sendCommand<string[]>(['SMEMBERS', key]),
        ),
      )
    )
      .flat()
      .map((id) => ({
        id,
        status: PickseatStatus.PENDING,
      }));

    const seats = await this.prismaService.cinemaLayoutSeat.findMany({
      where: {
        id: {
          in: picking_seats.map((seat) => uuidToBinary(seat.id)),
        },
      },
      select: {
        id: true,
        group: {
          select: {
            price: true,
          },
        }
      },
    });
    const seatPriceMap = seats.reduce<Record<string, number>>((acc, seat) => {
      acc[binaryToUuid(seat.id)] = seat.group?.price?.toNumber() ?? 0;
      return acc;
    }, {});

    const id = genId();
    const seatsPrice = picking_seats.reduce((acc, seat) => acc + seatPriceMap[seat.id] + perform.price.toNumber(), 0);
    const itemsPrice = items.reduce((acc, item) => acc + item.price.toNumber(), 0);
    const totalMoney = seatsPrice + itemsPrice;
    
    console.log('seatsPrice', seatsPrice);
    console.log('itemsPrice', itemsPrice);
    console.log('totalMoney', totalMoney);

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
      amount: totalMoney,
      data: validated,
    });
  }
}
