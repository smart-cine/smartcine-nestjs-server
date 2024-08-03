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
    // check seat exists in perform
    await this.prismaService.perform.findUniqueOrThrow({
      where: {
        id: body.perform_id,
        room: {
          cinema_layout: {
            layout_seats: {
              some: {
                id: body.layout_seat_id,
                available: true, // check if seat is available
              },
            },
          },
        },
      },
    });

    // EDGE CASE: check if user already picked seat in other perform - prevent spamming
    const scan = await this.redisService.sendCommand<[string, string[]]>([
      'SCAN',
      '0',
      'MATCH',
      `pickseat:*:${binaryToUuid(account.id)}`,
    ]);
    if (
      !scan[1].every((key) =>
        key.startsWith(`pickseat:${binaryToUuid(body.perform_id)}`),
      )
    ) {
      throw new Error('You already picked some seats in other perform!');
    }

    await this.redisService.sendCommand([
      'SADD',
      `pickseat:${binaryToUuid(body.perform_id)}:${binaryToUuid(account.id)}`,
      `${binaryToUuid(body.layout_seat_id)}`,
    ]);
    await this.redisService.sendCommand([
      'EXPIRE',
      `pickseat:${binaryToUuid(body.perform_id)}:${binaryToUuid(account.id)}`,
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
    const scan = await this.redisService.sendCommand<[string, string[]]>([
      'SCAN',
      '0',
      'MATCH',
      `pickseat:${binaryToUuid(query.perform_id)}:*`,
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

  async deleteItem(account: SessionAccount, body: CreatePickseatDto) {
    await this.redisService.sendCommand([
      'SREM',
      `pickseat:${binaryToUuid(body.perform_id)}:${binaryToUuid(account.id)}`,
      `${binaryToUuid(body.layout_seat_id)}`,
    ]);
    // await this.prismaService.pickSeat.delete({
    //   where: {
    //     id,
    //   },
    // });
  }
}
