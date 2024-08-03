import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { binaryToUuid } from 'src/utils/uuid';
import { CreateCinemaProviderDto } from './dto/CreateCinemaProvider.dto';
import { genId } from 'src/shared/genId';
import { UpdateCinemaProviderDto } from './dto/UpdateCinemaProvider.dto';
import { QueryCinemaProviderDto } from './dto/QueryCinemaProvider.dto';
import { IdDto } from 'src/shared/id.dto';
import {
  genPaginationParams,
  genPaginationResponse,
} from 'src/pagination/pagination.util';

@Injectable()
export class CinemaProviderService {
  constructor(private prismaService: PrismaService) {}

  async getItems(query: QueryCinemaProviderDto) {
    const conditions = {};

    const [items, pagination] = genPaginationResponse({
      items: await this.prismaService.cinemaProvider.findMany({
        ...genPaginationParams(query),
        ...conditions,
      }),
      total: await this.prismaService.cinemaProvider.count({ ...conditions }),
      query,
    });

    return {
      data: items.map((item) => ({
        id: binaryToUuid(item.id),
        name: item.name,
        logo_url: item.logo_url,
        background_url: item.background_url,
      })),
      pagination,
    };
  }

  async getItem(id: IdDto['id']) {
    const item = await this.prismaService.cinemaProvider.findUniqueOrThrow({
      where: { id },
      include: {
        ratings: {
          select: {
            score: true,
          },
        },
      },
    });

    return {
      id: binaryToUuid(item.id),
      name: item.name,
      logo_url: item.logo_url,
      background_url: item.background_url,
      rating: {
        score:
          item.ratings.reduce((acc, curr) => acc + curr.score, 0) /
          item.ratings.length,
        length: item.ratings.length,
      },
    };
  }

  async createItem(body: CreateCinemaProviderDto) {
    const item = await this.prismaService.cinemaProvider.create({
      data: {
        id: genId(),
        name: body.name,
        logo_url: body.logo_url,
        background_url: body.background_url,
      },
    });
    return {
      id: binaryToUuid(item.id),
      name: item.name,
      logo_url: item.logo_url,
      background_url: item.background_url,
    };
  }

  async updateItem(id: IdDto['id'], body: UpdateCinemaProviderDto) {
    const item = await this.prismaService.cinemaProvider.update({
      where: { id },
      data: {
        name: body.name,
        logo_url: body.logo_url,
        background_url: body.background_url,
      },
    });

    return {
      id: binaryToUuid(item.id),
      name: item.name,
      logo_url: item.logo_url,
      background_url: item.background_url,
    };
  }

  async deleteItem(id: IdDto['id']) {
    await this.prismaService.cinemaProvider.delete({
      where: { id },
    });
  }
}
