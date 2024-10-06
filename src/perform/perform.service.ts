import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePerformDto } from './dto/CreatePerform.dto';
import { genId } from 'src/shared/genId';
import { QueryPerformListCinemaDto } from './dto/QueryPerformListCinema.dto';
import { QueryPerformListFilmDto } from './dto/QueryPerformListFilm.dto'
import {
  genPaginationParams,
  genPaginationResponse,
} from 'src/pagination/pagination.util';
import { binaryToUuid } from 'src/utils/uuid';
import { UpdatePerformDto } from './dto/UpdatePerform.dto';
import { TAccountRequest } from 'src/account/decorators/AccountRequest.decorator';
import { OwnershipService } from 'src/ownership/ownership.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PerformService {
  constructor(
    private prismaService: PrismaService,
    private ownershipService: OwnershipService,
  ) {}

  private async getProviderIdByFilmId(filmId: Buffer) {
    const film = await this.prismaService.film.findUniqueOrThrow({
      where: {
        id: filmId,
      },
      select: {
        cinema_provider_id: true,
      },
    });
    return film.cinema_provider_id;
  }

  async getItemsListCinema(query: QueryPerformListCinemaDto) {
    const conditions: Prisma.CinemaWhereInput = {
      cinema_provider_id: query.cinema_provider_id,
      rooms: {
        some: {
          performs: {
            some: {
              film_id: query.film_id,
              start_time: {
                gte: query.start_time,
              },
            },
          },
        }
      }
    };

    const [items, pagination] = genPaginationResponse({
      items: await this.prismaService.cinema.findMany({
        ...genPaginationParams(query, conditions),
        select: {
          id: true,
          rooms: {
            select: {
              performs: {
                select: {
                  id: true,
                  film_id: true,
                  cinema_room_id: true,
                  start_time: true,
                  end_time: true,
                  translate_type: true,
                  view_type: true,
                  price: true,
                },
                where: conditions.rooms?.some?.performs?.some,
              },
            },
            where: conditions.rooms?.some,
          }
        }
      }),
      total: await this.prismaService.cinema.count({ where: conditions }),
      query,
    });

    return {
      data: items.map((item) => ({
        cinema_id: binaryToUuid(item.id),
        performs: item.rooms.flatMap((room) => room.performs).map((perform) => ({
          id: binaryToUuid(perform.id),
          film_id: binaryToUuid(perform.film_id),
          cinema_id: binaryToUuid(query.cinema_provider_id),
          cinema_room_id: binaryToUuid(perform.cinema_room_id),
          start_time: perform.start_time,
          end_time: perform.end_time,
          translate_type: perform.translate_type,
          view_type: perform.view_type,
          price: perform.price,
        })),
      })),
      pagination,
    };
  }

  async getItemsListFilm(query: QueryPerformListFilmDto) {
    const conditions: Prisma.FilmWhereInput = {
      // TODO: filter area here
      performs: {
        some: {
          room: {
            cinema_id: query.cinema_id,
          },
          start_time: {
            gte: query.start_time,
          },
        },
      },
    };

    const [items, pagination] = genPaginationResponse({
      items: await this.prismaService.film.findMany({
        ...genPaginationParams(query, conditions),
        select: {
          id: true,
          performs: {
            select: {
              id: true,
              cinema_room_id: true,
              start_time: true,
              end_time: true,
              translate_type: true,
              view_type: true,
              price: true,
            },
            where: conditions.performs?.some,
          },
        }
      }),
      total: await this.prismaService.film.count({ where: conditions }),
      query,
    });

    return {
      data: items.map((item) => ({
        film_id: binaryToUuid(item.id),
        performs: item.performs.map((perform) => ({
          id: binaryToUuid(perform.id),
          film_id: binaryToUuid(item.id),
          cinema_id: binaryToUuid(query.cinema_id),
          cinema_room_id: binaryToUuid(perform.cinema_room_id),
          start_time: perform.start_time,
          end_time: perform.end_time,
          translate_type: perform.translate_type,
          view_type: perform.view_type,
          price: perform.price,
        })),
      })),
      pagination,
    };
  }

  async getItem(id: Buffer) {
    const item = await this.prismaService.perform.findUniqueOrThrow({
      where: {
        id,
      },
      select: {
        id: true,
        film_id: true,
        cinema_room_id: true,
        start_time: true,
        end_time: true,
        translate_type: true,
        view_type: true,
        price: true,
        room: {
          select: {
            cinema_id: true,
          }
        }
      }
    });
    return {
      id: binaryToUuid(item.id),
      film_id: binaryToUuid(item.film_id),
      cinema_room_id: binaryToUuid(item.cinema_room_id),
      cinema_id: binaryToUuid(item.room.cinema_id),
      start_time: item.start_time,
      end_time: item.end_time,
      translate_type: item.translate_type,
      view_type: item.view_type,
      price: item.price,
    };
  }

  async createItem(body: CreatePerformDto, account: TAccountRequest) {
    await this.ownershipService.accountHasAccess(
      body.cinema_room_id,
      account.id,
    );

    const id = genId();

    await this.ownershipService.createItem(async () => {
      await this.prismaService.perform.createMany({
        data: {
          id: id,
          film_id: body.film_id,
          cinema_room_id: body.cinema_room_id,
          start_time: body.start_time,
          end_time: body.end_time,
          translate_type: body.translate_type,
          view_type: body.view_type,
          price: body.price,
        },
      });
      return {
        item_id: id,
        parent_id: body.cinema_room_id,
      };
    });

    return {
      id: binaryToUuid(id),
      film_id: binaryToUuid(body.film_id),
      cinema_room_id: binaryToUuid(body.cinema_room_id),
      start_time: body.start_time,
      end_time: body.end_time,
      translate_type: body.translate_type,
      view_type: body.view_type,
      price: body.price,
    };
  }

  async updateItem(
    id: Buffer,
    body: UpdatePerformDto,
    account: TAccountRequest,
  ) {
    await this.ownershipService.checkAccountHasAccess(id, account.id);

    const item = await this.prismaService.perform.update({
      where: {
        id,
      },
      data: {
        start_time: body.start_time,
        end_time: body.end_time,
        translate_type: body.translate_type,
        view_type: body.view_type,
        price: body.price,
      },
    });

    return {
      id: binaryToUuid(id),
      start_time: item.start_time,
      end_time: item.end_time,
      translate_type: item.translate_type,
      view_type: item.view_type,
      price: item.price,
    };
  }

  async deleteItem(id: Buffer, account: TAccountRequest) {
    await this.ownershipService.checkAccountHasAccess(id, account.id);

    await this.ownershipService.deleteItem(async () => {
      await this.prismaService.perform.deleteMany({
        where: {
          id,
        },
      });
      return id;
    });
  }
}
