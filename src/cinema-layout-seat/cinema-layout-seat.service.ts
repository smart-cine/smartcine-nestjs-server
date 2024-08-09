import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCinemaLayoutSeatDto } from './dto/CreateCinemaLayoutSeat.dto';
import { genId } from 'src/shared/genId';
import { binaryToUuid } from 'src/utils/uuid';
import { IdDto } from 'src/shared/id.dto';
import { UpdateCinemaLayoutSeat } from './dto/UpdateCinemaLayoutSeat.dto';

@Injectable()
export class CinemaLayoutSeatService {
  constructor(private prismaService: PrismaService) {}

  async createItem(body: CreateCinemaLayoutSeatDto) {
    // check if seat already exists
    const seatExist = await this.prismaService.cinemaLayoutSeat.findFirst({
      where: {
        layout: { id: body.layout_id },
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
      throw new Error('Seat already exists');
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

    const item = await this.prismaService.cinemaLayoutSeat.create({
      data: {
        id: genId(),
        layout: { connect: { id: body.layout_id } },
        group: { connect: { id: body.group_id } },
        code: body.code,
        x: body.x,
        y: body.y,
      },
    });

    return {
      id: binaryToUuid(item.id),
      layout_id: binaryToUuid(item.cinema_layout_id),
      group_id: binaryToUuid(item.group_id),
      code: item.code,
      x: item.x,
      y: item.y,
    };
  }

  async updateItem(id: IdDto['id'], body: UpdateCinemaLayoutSeat) {
    const item = await this.prismaService.cinemaLayoutSeat.update({
      where: { id: id },
      data: {
        code: body.code,
      },
    });

    return {
      id: binaryToUuid(item.id),
      layout_id: binaryToUuid(item.cinema_layout_id),
      group_id: binaryToUuid(item.group_id),
      code: item.code,
      x: item.x,
      y: item.y,
    };
  }

  async deleteItem(id: IdDto['id']) {
    await this.prismaService.cinemaLayoutSeat.delete({
      where: { id: id },
    });
  }
}
