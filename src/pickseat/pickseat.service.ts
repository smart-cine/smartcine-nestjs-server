import { binaryToUuid } from 'src/utils/uuid';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePickseatDto } from './dto/CreatePickseat.dto';
import { RedisService } from 'src/redis/redis.service';
import { QueryPickseatDto } from './dto/QueryPickseat.dto';
import { PickseatStatus } from './constants/pickseat.constant';
import { TAccountRequest } from 'src/account/decorators/AccountRequest.decorator';
import { OwnershipService } from 'src/ownership/ownership.service';

@Injectable()
export class PickseatService {
  constructor(
    private prismaService: PrismaService,
    private redisService: RedisService,
  ) {}

  async createItem(body: CreatePickseatDto, account: TAccountRequest) {
    // check seat exists in perform
    await this.prismaService.perform.findUniqueOrThrow({
      where: {
        id: body.perform_id,
        room: {
          layout: {
            layout_seats: {
              some: {
                id: body.layout_seat_id,
              },
            },
          },
        },
      },
      select: {
        id: true,
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
  }

  async getItems(query: QueryPickseatDto) {
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
      await this.prismaService.pickseat.findMany({
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

  async deleteItem(body: CreatePickseatDto, account: TAccountRequest) {
    await this.redisService.sendCommand([
      'SREM',
      `pickseat:${binaryToUuid(body.perform_id)}:${binaryToUuid(account.id)}`,
      `${binaryToUuid(body.layout_seat_id)}`,
    ]);
  }
}
