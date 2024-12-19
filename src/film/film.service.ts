import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateFilmDto } from './dto/CreateFilm.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateFilmDto } from './dto/UpdateFilm.dto';
import { genId } from 'src/shared/genId';
import { binaryToUuid } from 'src/utils/uuid';
import {
  genPaginationParams,
  genPaginationResponse,
} from 'src/pagination/pagination.util';
import { QueryFilmDto } from './dto/QueryFilm.dto';
import { OwnershipService } from 'src/ownership/ownership.service';
import { TAccountRequest } from 'src/account/decorators/AccountRequest.decorator';
import { Prisma } from '@prisma/client';

@Injectable()
export class FilmService {
  constructor(
    private prismaService: PrismaService,
    private ownershipService: OwnershipService,
  ) {}

  async getItems(query: QueryFilmDto) {
    const conditions: Prisma.FilmWhereInput = {};

    const [items, pagination] = genPaginationResponse({
      items: await this.prismaService.film.findMany({
        ...genPaginationParams(query, conditions),
        select: {
          id: true,
          cinema_provider_id: true,
          tags: {
            select: {
              tag: true,
            },
          },
          title: true,
          director: true,
          description: true,
          release_date: true,
          country: true,
          restrict_age: true,
          duration: true,
          picture_url: true,
          background_url: true,
          trailer_url: true,
          language: true,
          ratings: {
            select: {
              score: true,
            },
          },
        },
      }),
      total: await this.prismaService.film.count({ where: conditions }),
      query,
    });

    return {
      data: items.map((item) => ({
        id: binaryToUuid(item.id),
        cinema_provider_id: binaryToUuid(item.cinema_provider_id),
        tags: item.tags.map((tag) => tag.tag.name),
        title: item.title,
        director: item.director,
        description: item.description,
        release_date: item.release_date,
        country: item.country,
        restrict_age: item.restrict_age,
        duration: item.duration,
        picture_url: item.picture_url,
        background_url: item.background_url,
        trailer_url: item.trailer_url,
        language: item.language,
        rating: {
          score:
            item.ratings.reduce((acc, rating) => acc + rating.score, 0) /
              item.ratings.length || 0,
          count: item.ratings.length,
        },
      })),
      pagination,
    };
  }

  async getTopItems(query: QueryFilmDto) {
    const conditions: Prisma.FilmWhereInput = {
      performs: {
        some: {
          start_time: {
            // gte: new Date(),
            // TODO: add this to query available films
          },
        }
      }
    };
    const orderBy: Prisma.FilmOrderByWithRelationInput = {
      performs: {
        _count: 'desc'
      }
    }

    const [items, pagination] = genPaginationResponse({
      items: await this.prismaService.film.findMany({
        ...genPaginationParams(query, conditions),
        select: {
          id: true,
          cinema_provider_id: true,
          tags: {
            select: {
              tag: true,
            },
          },
          title: true,
          director: true,
          description: true,
          release_date: true,
          country: true,
          restrict_age: true,
          duration: true,
          picture_url: true,
          background_url: true,
          trailer_url: true,
          language: true,
          ratings: {
            select: {
              score: true,
            },
          },
        },
        orderBy,
      }),
      total: await this.prismaService.film.count({ where: conditions }),
      query,
    });

    console.log("top films", items)

    return {
      data: items.map((item) => ({
        id: binaryToUuid(item.id),
        cinema_provider_id: binaryToUuid(item.cinema_provider_id),
        tags: item.tags.map((tag) => tag.tag.name),
        title: item.title,
        director: item.director,
        description: item.description,
        release_date: item.release_date,
        country: item.country,
        restrict_age: item.restrict_age,
        duration: item.duration,
        picture_url: item.picture_url,
        background_url: item.background_url,
        trailer_url: item.trailer_url,
        language: item.language,
        rating: {
          score:
            item.ratings.reduce((acc, rating) => acc + rating.score, 0) /
              item.ratings.length || 0,
          count: item.ratings.length,
        },
      })),
      pagination,
    };
  }

  async getItem(id: Buffer) {
    const film = await this.prismaService.film.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        cinema_provider_id: true,
        tags: {
          select: {
            tag: true,
          },
        },
        title: true,
        director: true,
        description: true,
        release_date: true,
        country: true,
        restrict_age: true,
        duration: true,
        picture_url: true,
        background_url: true,
        trailer_url: true,
        language: true,
        ratings: {
          select: {
            score: true,
          },
        },
      },
    });
    return {
      id: binaryToUuid(film.id),
      cinema_provider_id: binaryToUuid(film.cinema_provider_id),
      tags: film.tags.map((tag) => tag.tag.name),
      title: film.title,
      director: film.director,
      description: film.description,
      release_date: film.release_date,
      country: film.country,
      restrict_age: film.restrict_age,
      duration: film.duration,
      picture_url: film.picture_url,
      background_url: film.background_url,
      trailer_url: film.trailer_url,
      language: film.language,
      rating: {
        score:
          film.ratings.reduce((acc, rating) => acc + rating.score, 0) /
            film.ratings.length || 0,
        count: film.ratings.length,
      },
    };
  }

  async createItem(body: CreateFilmDto, account: TAccountRequest) {
    await this.ownershipService.checkAccountHasAccess(
      body.cinema_provider_id,
      account.id,
    );

    const id = genId();

    await this.ownershipService.createItem(async () => {
      await this.prismaService.$transaction([
        this.prismaService.film.createMany({
          data: {
            id: id,
            cinema_provider_id: body.cinema_provider_id,
            title: body.title,
            director: body.director,
            description: body.description,
            release_date: body.release_date,
            country: body.country,
            restrict_age: body.restrict_age,
            duration: body.duration,
            picture_url: body.picture_url,
            background_url: body.background_url,
            trailer_url: body.trailer_url,
            language: body.language,
          },
        }),
        this.prismaService.tag.createMany({
          data: body.tags.map((tag) => ({ name: tag })),
          skipDuplicates: true,
        }),
        this.prismaService.filmsOnTags.createMany({
          data: body.tags.map((tag) => ({
            film_id: id,
            tag_id: tag,
          })),
          skipDuplicates: true,
        }),
      ]);

      return {
        item_id: id,
        parent_id: body.cinema_provider_id,
      };
    });

    return {
      id: binaryToUuid(id),
      cinema_provider_id: binaryToUuid(body.cinema_provider_id),
      tags: body.tags,
      title: body.title,
      director: body.director,
      description: body.description,
      release_date: body.release_date,
      country: body.country,
      restrict_age: body.restrict_age,
      duration: body.duration,
      picture_url: body.picture_url,
      background_url: body.background_url,
      trailer_url: body.trailer_url,
      language: body.language,
    };
  }

  async updateItem(id: Buffer, body: UpdateFilmDto, account: TAccountRequest) {
    await this.ownershipService.checkAccountHasAccess(id, account.id);

    const item = await this.prismaService.film.update({
      where: { id },
      data: {
        title: body.title,
        director: body.director,
        description: body.description,
        release_date: body.release_date,
        country: body.country,
        restrict_age: body.restrict_age,
        duration: body.duration,
        picture_url: body.picture_url,
        background_url: body.background_url,
        trailer_url: body.trailer_url,
        language: body.language,
      },
      include: {
        tags: {
          select: {
            tag: true,
          },
        },
      },
    });

    return {
      id: binaryToUuid(id),
      tags: item.tags.map((tag) => tag.tag.name),
      title: item.title,
      director: item.director,
      description: item.description,
      release_date: item.release_date,
      country: item.country,
      restrict_age: item.restrict_age,
      duration: item.duration,
      picture_url: item.picture_url,
      background_url: item.background_url,
      trailer_url: item.trailer_url,
    };
  }

  async deleteItem(id: Buffer, account: TAccountRequest) {
    await this.ownershipService.checkAccountHasAccess(id, account.id);

    await this.ownershipService.deleteItem(async () => {
      await this.prismaService.film.delete({ where: { id } });
      return id;
    });
  }
}
