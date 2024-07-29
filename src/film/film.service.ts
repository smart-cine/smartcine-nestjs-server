import { Injectable } from '@nestjs/common';
import { CreateFilmDto } from './dto/CreateFilm.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateFilmDto } from './dto/UpdateFilm.dto';
import { genId } from 'src/shared/genId';
import { binaryToUuid } from 'src/utils/uuid';
import { genPaginationResponse } from 'src/pagination/pagination.util';
import { PaginationQueryDto } from 'src/pagination/PaginationQuery.dto';
@Injectable()
export class FilmService {
  constructor(private prismaService: PrismaService) {}
  async createItem(body: CreateFilmDto) {
    const film_id = genId();
    return await this.prismaService.$transaction([
      this.prismaService.film.create({
        data: {
          id: film_id,
          manager: {
            connect: { id: genId() },
          },
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
  deleteItem(id: Buffer) {
    this.prismaService.film.delete({ where: { id } });
  }
  async getItem(id: Buffer) {
    const film = await this.prismaService.film.findUniqueOrThrow({
      where: { id },
    });
    return {
      ...film,
      id: binaryToUuid(film.id),
      manager_id: binaryToUuid(film.manager_id),
      cinema_provider_id: binaryToUuid(film.cinema_provider_id),
    };
  }
  async getItems(pagination: PaginationQueryDto) {
    const response = await genPaginationResponse({
      prisma: this.prismaService,
      modelName: 'film',
      pagination,
    });

    return {
      data: response.data.map((film) => ({
        ...film,
        id: binaryToUuid(film.id),
        manager_id: binaryToUuid(film.manager_id),
        cinema_provider_id: binaryToUuid(film.cinema_provider_id),
      })),
      pagination: response.pagination,
    };
  }
  updateItem(id: Buffer, body: UpdateFilmDto) {
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
}
