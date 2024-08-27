import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePerformDto } from './dto/CreatePerform.dto';
import { genId } from 'src/shared/genId';
import { QueryPerformDto } from './dto/QueryPerform.dto';
import {
  genPaginationParams,
  genPaginationResponse,
} from 'src/pagination/pagination.util';
import { binaryToUuid } from 'src/utils/uuid';
import { UpdatePerformDto } from './dto/UpdatePerform.dto';
import { TAccountRequest } from 'src/account/decorators/AccountRequest.decorator';
import { OwnershipService } from 'src/ownership/ownership.service';

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

  async getItems(query: QueryPerformDto) {
    const conditions = {
      // TODO: add somethign here
      // where: query.cinema_id
      //   ? {
      //       room: {
      //         cinema_id: query.cinema_id,
      //       },
      //     }
      //   : undefined,
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

  async getItem(id: Buffer) {
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
