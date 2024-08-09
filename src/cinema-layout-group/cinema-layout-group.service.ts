import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { IdDto } from 'src/shared/id.dto';
import { binaryToUuid } from 'src/utils/uuid';
import { UpdateCinemaLayoutGroupDto } from './dto/UpdateCinemaLayoutGroup.dto';
import { CreateCinemaLayoutGroupDto } from './dto/CreateCinemaLayoutGroup.dto';
import { genId } from 'src/shared/genId';

@Injectable()
export class CinemaLayoutGroupService {
  constructor(private prismaService: PrismaService) {}

  async createItem(body: CreateCinemaLayoutGroupDto) {
    const item = await this.prismaService.cinemaLayoutGroup.create({
      data: {
        id: genId(),
        layout: { connect: { id: body.layout_id } },
        name: body.name,
        color: body.color,
        price: body.price,
      },
    });

    return {
      id: binaryToUuid(item.id),
      cinema_layout_id: binaryToUuid(item.cinema_layout_id),
      name: item.name,
      color: item.color,
      price: item.price,
    };
  }

  async updateItem(id: IdDto['id'], body: UpdateCinemaLayoutGroupDto) {
    const item = await this.prismaService.cinemaLayoutGroup.update({
      where: { id },
      data: {
        name: body.name,
        color: body.color,
        price: body.price,
      },
    });

    return {
      id: binaryToUuid(item.id),
      cinema_layout_id: binaryToUuid(item.cinema_layout_id),
      name: item.name,
      color: item.color,
      price: item.price,
    };
  }

  async deleteItem(id: IdDto['id']) {
    await this.prismaService.cinemaLayoutGroup.delete({ where: { id } });
  }
}
