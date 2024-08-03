import { SessionAccount } from './../account/dto/SessionAccount.dto';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePerformDto } from './dto/CreatePerform.dto';
import { genId } from 'src/shared/genId';
import { QueryPerformDto } from './dto/QueryPerform.dto';
import {
  genPaginationParams,
  genPaginationResponse,
} from 'src/pagination/pagination.util';
import { binaryToUuid } from 'src/utils/uuid';
import { PaginationQueryDto } from 'src/pagination/PaginationQuery.dto';
import { IdDto } from 'src/shared/id.dto';
import { UpdatePerformDto } from './dto/UpdatePerform.dto';

@Injectable()
export class PerformService {
  constructor(private prismaService: PrismaService) {}

  async createItem(account: SessionAccount, body: CreatePerformDto) {
    return this.prismaService.perform.create({
      data: {
        id: genId(),
        manager: {
          connect: {
            id: account.id,
          },
        },
        film: {
          connect: {
            id: body.film_id,
          },
        },
        room: {
          connect: {
            id: body.cinema_room_id,
          },
        },
        start_time: body.start_time,
        end_time: body.end_time,
        translate_type: body.translate_type,
        view_type: body.view_type,
        price: body.price,
      },
    });
  }

  async getItem(id: IdDto['id']) {
    const item = await this.prismaService.perform.findUniqueOrThrow({
      where: {
        id,
      },
    });
    return {
      id: binaryToUuid(item.id),
      film_id: binaryToUuid(item.film_id),
      cinema_room_id: binaryToUuid(item.cinema_room_id),
      start_time: item.start_time,
      end_time: item.end_time,
      translate_type: item.translate_type,
      view_type: item.view_type,
      price: item.price,
    };
  }

  async getItems(query: QueryPerformDto) {
    const conditions = {
      where: query.cinema_id
        ? {
            room: {
              cinema_id: query.cinema_id,
            },
          }
        : undefined,
    };

    const [items, pagination] = genPaginationResponse({
      items: await this.prismaService.perform.findMany({
        ...genPaginationParams(query),
        ...conditions,
        where: {},
      }),
      total: await this.prismaService.perform.count({ ...conditions }),
      query,
    });

    return {
      data: items.map((item) => ({
        id: binaryToUuid(item.id),
        film_id: binaryToUuid(item.film_id),
        cinema_room_id: binaryToUuid(item.cinema_room_id),
        start_time: item.start_time,
        end_time: item.end_time,
        translate_type: item.translate_type,
        view_type: item.view_type,
        price: item.price,
      })),
      pagination,
    };
  }

  async updateItem(id: IdDto['id'], body: UpdatePerformDto) {
    const item = await this.prismaService.perform.update({
      where: {
        id,
      },
      data: {
        film: {
          connect: {
            id: body.film_id,
          },
        },
        room: {
          connect: {
            id: body.cinema_room_id,
          },
        },
        start_time: body.start_time,
        end_time: body.end_time,
        translate_type: body.translate_type,
        view_type: body.view_type,
        price: body.price,
      },
    });
    return {
      id: binaryToUuid(item.id),
      film_id: binaryToUuid(item.film_id),
      cinema_room_id: binaryToUuid(item.cinema_room_id),
      start_time: item.start_time,
      end_time: item.end_time,
      translate_type: item.translate_type,
      view_type: item.view_type,
      price: item.price,
    };
  }

  async deleteItem(id: IdDto['id']) {
    const item = await this.prismaService.perform.delete({
      where: {
        id,
      },
    });
    return {
      id: binaryToUuid(item.id),
      film_id: binaryToUuid(item.film_id),
      cinema_room_id: binaryToUuid(item.cinema_room_id),
      start_time: item.start_time,
      end_time: item.end_time,
      translate_type: item.translate_type,
      view_type: item.view_type,
      price: item.price,
    };
  }
}
