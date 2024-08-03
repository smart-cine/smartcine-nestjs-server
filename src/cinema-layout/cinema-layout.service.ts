import { SessionAccount } from './../account/dto/SessionAccount.dto';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryCinemaLayoutDto } from './dto/QueryCinemaLayout.dto';
import { IdDto } from 'src/shared/id.dto';
import { CreateCinemaLayoutDto } from './dto/CreateCinemaLayout.dto';
import { genId } from 'src/shared/genId';
import { UpdateCinemaLayoutDto } from './dto/UpdateCinemaLayout.dto';

@Injectable()
export class CinemaLayoutService {
  constructor(private prismaService: PrismaService) {}

  async getItems(query: QueryCinemaLayoutDto) {
    return this.prismaService.cinemaLayout.findMany();
  }

  async getItem(id: IdDto['id']) {
    return this.prismaService.cinemaLayout.findUnique({
      where: { id },
    });
  }

  async createItem(account: SessionAccount, body: CreateCinemaLayoutDto) {
    return this.prismaService.cinemaLayout.create({
      data: {
        id: genId(),
        manager: {
          connect: { id: account.id },
        },
        rows: body.rows,
        columns: body.columns,
      },
    });
  }

  async updateItem(id: IdDto['id'], body: UpdateCinemaLayoutDto) {
    return this.prismaService.cinemaLayout.update({
      where: { id },
      data: {
        rows: body.rows,
        columns: body.columns,
      },
    });
  }

  async deleteItem(id: IdDto['id']) {
    return this.prismaService.cinemaLayout.delete({
      where: { id },
    });
  }
}
