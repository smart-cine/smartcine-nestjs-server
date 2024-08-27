import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCinemaLayoutSeatDto } from './dto/CreateCinemaLayoutSeat.dto';
import { genId } from 'src/shared/genId';
import { binaryToUuid } from 'src/utils/uuid';
import { IdDto } from 'src/shared/id.dto';
import { UpdateCinemaLayoutSeat } from './dto/UpdateCinemaLayoutSeat.dto';
import { ClientError } from 'src/response/error/ClientError';
import { ErrorKey } from 'src/response/constants/error-key';
import { TAccountRequest } from 'src/account/decorators/AccountRequest.decorator';
import { OwnershipService } from 'src/ownership/ownership.service';

@Injectable()
export class CinemaLayoutSeatService {
  constructor(
    private prismaService: PrismaService,
    private ownershipService: OwnershipService,
  ) {}

  async createItem(body: CreateCinemaLayoutSeatDto, account: TAccountRequest) {
    await this.ownershipService.checkAccountHasAccess(
      body.layout_id,
      account.id,
    );

    // check if seat already exists
    const seatExist = await this.prismaService.cinemaLayoutSeat.findFirst({
      where: {
        cinema_layout_id: body.layout_id,
        OR: [
          {
            x: body.x,
            y: body.y,
          },
          {
            code: body.code,
          },
        ],
      },
      select: { id: true },
    });

    if (seatExist) {
      throw new ClientError(
        'Seat or code already exists',
        ErrorKey.SEAT_EXISTS,
      );
    }

    // check if seat is not out of bounds
    const layout = await this.prismaService.cinemaLayout.findUnique({
      where: { id: body.layout_id },
      select: { rows: true, columns: true },
    });

    if (!layout) {
      throw new Error('Layout not found');
    }
    if (body.x + 1 > layout.columns || body.y + 1 > layout.rows) {
      throw new Error('Seat is out of bounds');
    }

    const id = genId();
    await this.ownershipService.createItem(async () => {
      await this.prismaService.cinemaLayoutSeat.createMany({
        data: {
          id: id,
          cinema_layout_id: body.layout_id,
          group_id: body.group_id,
          code: body.code,
          x: body.x,
          y: body.y,
        },
      });
      return {
        item_id: id,
        parent_id: body.layout_id,
      };
    });

    return {
      id: binaryToUuid(id),
      layout_id: binaryToUuid(body.layout_id),
      group_id: binaryToUuid(body.group_id),
      code: body.code,
      x: body.x,
      y: body.y,
    };
  }

  async updateItem(
    id: Buffer,
    body: UpdateCinemaLayoutSeat,
    account: TAccountRequest,
  ) {
    await this.ownershipService.checkAccountHasAccess(id, account.id);

    const item = await this.prismaService.cinemaLayoutSeat.update({
      where: { id: id },
      data: {
        code: body.code,
      },
    });

    return {
      id: binaryToUuid(id),
      cinema_layout_id: binaryToUuid(item.cinema_layout_id),
      group_id: binaryToUuid(item.group_id),
      code: body.code,
      x: item.x,
      y: item.y,
    };
  }

  async deleteItem(id: Buffer, account: TAccountRequest) {
    await this.ownershipService.checkAccountHasAccess(id, account.id);

    await this.ownershipService.deleteItem(async () => {
      await this.prismaService.cinemaLayoutSeat.deleteMany({
        where: { id: id },
      });
      return id;
    });
  }
}
