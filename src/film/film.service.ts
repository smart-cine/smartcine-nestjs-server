import { SessionAccount } from './../account/dto/SessionAccount.dto';
import { Injectable } from '@nestjs/common';
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
import { IdDto } from 'src/shared/id.dto';

@Injectable()
export class FilmService {
  constructor(private prismaService: PrismaService) {}

  async getItems(query: QueryFilmDto) {
    const conditions = {};

    const [items, pagination] = genPaginationResponse({
      items: await this.prismaService.film.findMany({
        ...genPaginationParams(query),
        ...conditions,
        include: {
          tags: {
            select: {
              tag: true,
            },
          },
        },
      }),
      total: await this.prismaService.film.count({ ...conditions }),
      query,
    });

    return {
      data: items.map((item) => ({
        id: binaryToUuid(item.id),
        manager_id: binaryToUuid(item.manager_id),
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
      })),
      pagination,
    };
  }

  async getItem(id: IdDto['id']) {
    const film = await this.prismaService.film.findUniqueOrThrow({
      where: { id },
      include: {
        tags: {
          select: {
            tag: true,
          },
        },
      },
    });
    return {
      id: binaryToUuid(film.id),
      manager_id: binaryToUuid(film.manager_id),
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
    };
  }

  async createItem(account: SessionAccount, body: CreateFilmDto) {
    const film_id = genId();
    return await this.prismaService.$transaction([
      this.prismaService.film.create({
        data: {
          id: film_id,
          manager: { connect: { id: account.id } },
          cinema_provider: {
            connect: { id: body.cinema_provider_id },
          },
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
          film_id: film_id,
          tag_id: tag,
        })),
      }),
    ]);
  }

  updateItem(id: IdDto['id'], body: UpdateFilmDto) {
    return this.prismaService.film.update({
      where: { id },
      data: {
        manager: { connect: { id: genId() } },
        cinema_provider: { connect: { id: body.cinema_provider_id } },
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
    });
  }

  deleteItem(id: IdDto['id']) {
    this.prismaService.film.delete({ where: { id } });
  }
}
