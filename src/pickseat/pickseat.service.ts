import { SessionAccount } from './../account/dto/SessionAccount.dto';
import { binaryToUuid } from 'src/utils/uuid';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePickseatDto } from './dto/CreatePickseat.dto';
import { genId } from 'src/shared/genId';
import { PaginationQueryDto } from 'src/pagination/PaginationQuery.dto';
import { RedisService } from 'src/redis/redis.service';
import { QueryPickseatDto } from './dto/QueryPickseat.dto';
import { PickseatStatus } from './constants/pickseat.constant';

@Injectable()
export class PickseatService {
  constructor(
    private prismaService: PrismaService,
    private redisService: RedisService,
  ) {}

  async createItem(account: SessionAccount, body: CreatePickseatDto) {
    await this.redisService.sendCommand([
      'SADD',
      `pickseat:${binaryToUuid(account.id)}`,
      binaryToUuid(body.layout_seat_id),
    ]);
    await this.redisService.sendCommand([
      'EXPIRE',
      `pickseat:${binaryToUuid(account.id)}`,
      String(15 * 60),
    ]);

    // check in redis
    // const picking_seats = await this.redisService.sendCommand<string[]>(['SMEMBERS', `pickseat:${}`]);
    // if (this.redisService.hget(body.account_id)) {
    //   throw new Error('Seat already picked');
    // }
    // check in db
    // await this.prismaService.pickSeat.create({
    //   data: {
    //     id: genId(),
    //     account: {
    //       connect: { id: genId() },
    //     },
    //     perform: {
    //       connect: { id: body.perform_id },
    //     },
    //     layout_seat: {
    //       connect: { id: body.layout_seat_id },
    //     },
    //   },
    // });
  }

  // async getItem(id: Buffer) {
  //   const item = await this.prismaService.pickSeat.findUniqueOrThrow({
  //     where: {
  //       id,
  //     },
  //   });

  //   return {
  //     id: binaryToUuid(item.id),
  //     account_id: binaryToUuid(item.account_id),
  //     layout_seat_id: binaryToUuid(item.layout_seat_id),
  //   };
  // }

  async getItems(account: SessionAccount, query: QueryPickseatDto) {
    const picking_seats = (
      (await this.redisService.sendCommand([
        'SMEMBERS',
        `pickseat:${binaryToUuid(account.id)}`,
      ])) as string[]
    ).map((id) => ({
      id,
      status: PickseatStatus.PENDING,
    }));
    const picked_seats = (
      await this.prismaService.pickSeat.findMany({
        where: {
          perform_id: query.perform_id,
        },
        select: {
          layout_seat_id: true,
        },
      })
    ).map((seat) => ({
      id: binaryToUuid(seat.layout_seat_id),
      status: PickseatStatus.BOOKED,
    }));

    return picking_seats.concat(picked_seats);
  }

  async deleteItem(account: SessionAccount, id: Buffer) {
    await this.redisService.sendCommand([
      'SREM',
      `pickseat:${binaryToUuid(account.id)}`,
      binaryToUuid(id),
    ]);
    // await this.prismaService.pickSeat.delete({
    //   where: {
    //     id,
    //   },
    // });
  }
}
