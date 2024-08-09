import { SessionAccount } from 'src/account/dto/SessionAccount.dto';
import { Injectable } from '@nestjs/common';
import {
  genPaginationParams,
  genPaginationResponse,
} from 'src/pagination/pagination.util';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryCinemaLayoutDto } from './dto/QueryCinemaLayout.dto';
import { binaryToUuid, uuidToBinary } from 'src/utils/uuid';
import { IdDto } from 'src/shared/id.dto';
import { CreateCinemaLayoutDto } from './dto/CreateCinemaLayout.dto';
import { genId } from 'src/shared/genId';
import { UpdateCinemaLayoutDto } from './dto/UpdateCinemaLayout.dto';
import { CloneCinemaLayoutDto } from './dto/CloneCinemaLayout.dto';

@Injectable()
export class CinemaLayoutService {
  constructor(private prismaService: PrismaService) {}

  async getItems(query: QueryCinemaLayoutDto) {
    const conditions = {
      where: query.provider_id ? { provider_id: query.provider_id } : undefined,
    };

    const [items, pagination] = genPaginationResponse({
      items: await this.prismaService.cinemaLayout.findMany({
        ...genPaginationParams(query),
        ...conditions,
        include: { layout_seats: true, layout_groups: true },
      }),
      total: await this.prismaService.cinemaLayout.count({ ...conditions }),
      query,
    });

    return {
      data: items.map((item) => ({
        id: binaryToUuid(item.id),
        provider_id: binaryToUuid(item.provider_id),
        rows: item.rows,
        columns: item.columns,
        seats: item.layout_seats.map((seat) => [seat.x, seat.y]),
      })),
      pagination,
    };
  }

  async getItem(id: IdDto['id']) {
    const item = await this.prismaService.cinemaLayout.findUniqueOrThrow({
      where: { id },
      include: { layout_seats: true, layout_groups: true },
    });

    return {
      id: binaryToUuid(item.id),
      provider_id: binaryToUuid(item.provider_id),
      rows: item.rows,
      columns: item.columns,
      groups: item.layout_groups.map((group) => ({
        id: binaryToUuid(group.id),
        name: group.name,
        color: group.color,
        price: group.price,
      })),
      seats: item.layout_seats.map((seat) => ({
        id: binaryToUuid(seat.id),
        group_id: binaryToUuid(seat.group_id),
        code: seat.code,
        x: seat.x,
        y: seat.y,
      })),
    };
  }

  async createItem(account: SessionAccount, body: CreateCinemaLayoutDto) {
    const item = await this.prismaService.cinemaLayout.create({
      data: {
        id: genId(),
        account_id: account.id,
        provider_id: body.provider_id,
        rows: body.rows,
        columns: body.columns,
      },
    });

    return {
      id: binaryToUuid(item.id),
      provider_id: binaryToUuid(item.provider_id),
      rows: item.rows,
      columns: item.columns,
    };
  }

  async cloneItem(account: SessionAccount, body: CloneCinemaLayoutDto) {
    console.time('findUnique layout');
    const item = await this.prismaService.cinemaLayout.findUniqueOrThrow({
      where: { id: body.layout_id },
      include: { layout_seats: true, layout_groups: true },
    });
    console.timeEnd('findUnique layout');

    const newLayoutId = genId();
    const newGroupIdMap = new Map<string, string>();
    const newSeatIdMap = new Map<string, string>();
    item.layout_groups.forEach((group) => {
      newGroupIdMap.set(binaryToUuid(group.id), binaryToUuid(genId()));
    });
    item.layout_seats.forEach((seat) => {
      newSeatIdMap.set(binaryToUuid(seat.id), binaryToUuid(genId()));
    });
    const getNewGroupId = (id: Buffer) =>
      uuidToBinary(newGroupIdMap.get(binaryToUuid(id))!);
    const getNewSeatId = (id: Buffer) =>
      uuidToBinary(newSeatIdMap.get(binaryToUuid(id))!);

    return this.prismaService.$transaction(async (tx) => {
      console.time('create layout & create groups');
      await tx.cinemaLayout.create({
        data: {
          id: newLayoutId,
          account_id: account.id,
          provider_id: item.provider_id,
          rows: item.rows,
          columns: item.columns,
          layout_groups: {
            createMany: {
              data: item.layout_groups.map((group) => ({
                id: getNewGroupId(group.id),
                name: group.name,
                color: group.color,
                price: group.price,
              })),
            },
          },
        },
        // include: { layout_groups: true },
        select: { id: true },
      });
      console.timeEnd('create layout & create groups');
      console.time('createMany seats');

      await tx.cinemaLayoutSeat.createMany({
        data: item.layout_seats.map((seat) => ({
          id: genId(),
          cinema_layout_id: newLayoutId,
          group_id: seat.group_id ? getNewGroupId(seat.group_id) : null,
          code: seat.code,
          x: seat.x,
          y: seat.y,
        })),
      });
      console.timeEnd('createMany seats');

      const clone = {
        id: newLayoutId,
        provider_id: item.provider_id,
        rows: item.rows,
        columns: item.columns,
        layout_groups: item.layout_groups.map((group) => ({
          id: getNewGroupId(group.id),
          name: group.name,
          color: group.color,
          price: group.price,
        })),
        layout_seats: item.layout_seats.map((seat) => ({
          id: getNewSeatId(seat.id),
          group_id: seat.group_id ? getNewGroupId(seat.group_id) : null,
          code: seat.code,
          x: seat.x,
          y: seat.y,
        })),
      };

      return {
        id: binaryToUuid(clone.id),
        provider_id: binaryToUuid(clone.provider_id),
        rows: clone.rows,
        columns: clone.columns,
        groups: clone.layout_groups.map((group) => ({
          id: binaryToUuid(group.id),
          name: group.name,
          color: group.color,
          price: group.price,
        })),
        seats: clone.layout_seats.map((seat) => ({
          id: binaryToUuid(seat.id),
          group_id: binaryToUuid(seat.group_id),
          code: seat.code,
          x: seat.x,
          y: seat.y,
        })),
      };
    });
  }

  async updateItem(id: IdDto['id'], body: UpdateCinemaLayoutDto) {
    const item = await this.prismaService.cinemaLayout.update({
      where: { id },
      data: {
        rows: body.rows,
        columns: body.columns,
      },
    });

    return {
      id: binaryToUuid(item.id),
      provider_id: binaryToUuid(item.provider_id),
      rows: item.rows,
      columns: item.columns,
    };
  }

  async deleteItem(id: IdDto['id']) {
    await this.prismaService.cinemaLayout.delete({ where: { id } });
  }
}
