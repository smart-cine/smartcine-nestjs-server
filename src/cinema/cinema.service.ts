import { binaryToUuid } from 'src/utils/uuid';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryCinemaDto } from './dto/QueryCinema.dto';
import {
  genPaginationParams,
  genPaginationResponse,
} from 'src/pagination/pagination.util';
import { CreateCinemaDto } from './dto/CreateCinema.dto';
import { genId } from 'src/shared/genId';
import { UpdateCinemaDto } from './dto/UpdateCinema.dto';
import { IdDto } from 'src/shared/id.dto';

@Injectable()
export class CinemaService {
  constructor(private prismaService: PrismaService) {}

  async getItems(query: QueryCinemaDto) {
    const conditions = {
      where: query.provider_id ? { provider_id: query.provider_id } : undefined,
    };

    const [items, pagination] = genPaginationResponse({
      items: await this.prismaService.cinema.findMany({
        ...genPaginationParams(query),
        ...conditions,
      }),
      total: await this.prismaService.cinema.count({ ...conditions }),
      query,
    });

    return {
      data: items.map((item) => ({
        id: binaryToUuid(item.id),
        provider_id: binaryToUuid(item.provider_id),
        name: item.name,
        address: item.address,
      })),
      pagination,
    };
  }

  async getItem(id: IdDto['id']) {
    const cinema = await this.prismaService.cinema.findUniqueOrThrow({
      where: { id },
    });

    return {
      id: binaryToUuid(cinema.id),
      provider_id: binaryToUuid(cinema.provider_id),
      name: cinema.name,
      address: cinema.address,
    };
  }

  async createItem(body: CreateCinemaDto) {
    const cinema = await this.prismaService.cinema.create({
      data: {
        id: genId(),
        provider_id: body.provider_id,
        name: body.name,
        address: body.address,
      },
    });

    return {
      id: binaryToUuid(cinema.id),
      provider_id: binaryToUuid(cinema.provider_id),
      name: cinema.name,
      address: cinema.address,
    };
  }

  async updateItem(id: IdDto['id'], body: UpdateCinemaDto) {
    const cinema = await this.prismaService.cinema.update({
      where: { id },
      data: {
        name: body.name,
        address: body.address,
      },
    });

    return {
      id: binaryToUuid(cinema.id),
      provider_id: binaryToUuid(cinema.provider_id),
      name: cinema.name,
      address: cinema.address,
    };
  }

  async deleteItem(id: IdDto['id']) {
    await this.prismaService.cinema.delete({ where: { id } });
  }
}
