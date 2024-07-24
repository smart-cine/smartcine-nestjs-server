import { Injectable } from '@nestjs/common';
import { CreateFilmDto } from './dto/CreateFilm.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateFilmDto } from './dto/UpdateFilm.dto';
import { genId } from 'src/shared/genId';
import { randomBytes } from 'crypto';

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
            connect: { id: randomBytes(16) },
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
  getItem(id: Buffer) {
    this.prismaService.film.findUnique({ where: { id } });
  }
  async getItems() {
    return this.prismaService.film.findMany();
  }
  updateItem(id: Buffer, body: UpdateFilmDto) {
    return this.prismaService.film.update({
      where: { id },
      data: {
        manager: { connect: { id: randomBytes(16) } },
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
