import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryCinemaRoomDto } from './dto/QueryCinemaRoom.dto';
import {
  genPaginationParams,
  genPaginationResponse,
} from 'src/pagination/pagination.util';
import { binaryToUuid } from 'src/utils/uuid';
import { IdDto } from 'src/shared/id.dto';
import { CreateCinemaRoomDto } from './dto/CreateCinemaRoom.dto';
import { genId } from 'src/shared/genId';
import { UpdateCinemaRoomDto } from './dto/UpdateCinemaRoom.dto';

@Injectable()
export class CinemaRoomService {
  constructor(private prismaService: PrismaService) {}

  async getItems(query: QueryCinemaRoomDto) {
    const conditions = {
      where: query.cinema_id ? { cinema_id: query.cinema_id } : {},
    };

    const [items, pagination] = genPaginationResponse({
      items: await this.prismaService.cinemaRoom.findMany({
        ...genPaginationParams(query),
        ...conditions,
      }),
      total: await this.prismaService.cinemaRoom.count({ ...conditions }),
      query,
    });

    return {
      data: items.map((item) => ({
        id: binaryToUuid(item.id),
        cinema_id: binaryToUuid(item.cinema_id),
        cinema_layout_id: binaryToUuid(item.cinema_layout_id),
        name: item.name,
      })),
      pagination,
    };
  }

  async getItem(id: IdDto['id']) {
    const item = await this.prismaService.cinemaRoom.findUniqueOrThrow({
      where: { id },
      include: {
        layout: {
          include: {
            layout_seats: true,
            layout_groups: true,
          },
        },
      },
    });

    return {
      id: binaryToUuid(item.id),
      cinema_id: binaryToUuid(item.cinema_id),
      name: item.name,
      layout: {
        rows: item.layout.rows,
        columns: item.layout.columns,
        seats: item.layout.layout_seats.map((seat) => ({
          id: binaryToUuid(seat.id),
          group_id: binaryToUuid(seat.group_id),
          code: seat.code,
          x: seat.x,
          y: seat.y,
        })),
        groups: item.layout.layout_groups.map((group) => ({
          id: binaryToUuid(group.id),
          name: group.name,
          color: group.color,
          price: group.price,
        })),
      },
    };
  }

  async createItem(body: CreateCinemaRoomDto) {
    const item = await this.prismaService.cinemaRoom.create({
      data: {
        id: genId(),
        cinema_id: body.cinema_id,
        cinema_layout_id: body.cinema_layout_id,
        name: body.name,
      },
    });

    return {
      id: binaryToUuid(item.id),
      cinema_id: binaryToUuid(item.cinema_id),
      cinema_layout_id: binaryToUuid(item.cinema_layout_id),
      name: item.name,
    };
  }

  async updateItem(id: IdDto['id'], body: UpdateCinemaRoomDto) {
    const item = await this.prismaService.cinemaRoom.update({
      where: { id },
      data: {
        name: body.name,
      },
    });

    return {
      id: binaryToUuid(item.id),
      cinema_id: binaryToUuid(item.cinema_id),
      cinema_layout_id: binaryToUuid(item.cinema_layout_id),
      name: item.name,
    };
  }

  async deleteItem(id: IdDto['id']) {
    await this.prismaService.cinemaRoom.delete({ where: { id } });
  }
}
