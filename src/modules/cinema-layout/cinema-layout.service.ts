import { Injectable, UnauthorizedException } from '@nestjs/common';
import {
  genPaginationParams,
  genPaginationResponse,
} from 'src/common/pagination/pagination.util';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { QueryCinemaLayoutDto } from './dto/QueryCinemaLayout.dto';
import { binaryToUuid, uuidToBinary } from 'src/utils/uuid';
import { CreateCinemaLayoutDto } from './dto/CreateCinemaLayout.dto';
import { genId } from 'src/shared/genId';
import { UpdateCinemaLayoutDto } from './dto/UpdateCinemaLayout.dto';
import { CloneCinemaLayoutDto } from './dto/CloneCinemaLayout.dto';
import { TAccountRequest } from 'src/modules/account/decorators/AccountRequest.decorator';
import { Prisma } from '@prisma/client';
import { OwnershipService } from 'src/common/ownership/ownership.service';

@Injectable()
export class CinemaLayoutService {
  constructor(
    private prismaService: PrismaService,
    private ownershipService: OwnershipService,
  ) {}

  public async cloneLayout(
    tx: Prisma.TransactionClient,
    layout_id: Buffer,
    room_id?: Buffer,
  ) {
    console.time('findUnique layout');
    const item = await this.prismaService.cinemaLayout.findUniqueOrThrow({
      where: { id: layout_id },
      include: { layout_seats: true, layout_groups: true },
    });
    console.timeEnd('findUnique layout');

    console.time('create layout & create groups');
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

    await this.ownershipService.createItem(async () => {
      const groupData = item.layout_groups.map((group) => ({
        id: getNewGroupId(group.id),
        cinema_layout_id: newLayoutId,
        name: group.name,
        color_code: group.color_code,
        price: group.price,
      }));
      await tx.cinemaLayout.createMany({
        data: {
          id: newLayoutId,
          cinema_provider_id: item.cinema_provider_id,
          cinema_room_id: room_id,
          rows: item.rows,
          columns: item.columns,
        },
      });
      await tx.cinemaLayoutGroup.createMany({
        data: groupData,
      });
      return [
        {
          item_id: newLayoutId,
          parent_id: room_id ? room_id : item.cinema_provider_id,
        },
      ].concat(
        groupData.map((group) => ({
          item_id: group.id,
          parent_id: newLayoutId,
        })),
      );
    });
    console.timeEnd('create layout & create groups');
    console.time('createMany seats');

    /* 
      onsole.time('create layout');
      await tx.cinemaLayout.createMany({
        data: {
          id: newLayoutId,
          cinema_provider_id: provider_id,
          rows: item.rows,
          columns: item.columns,
        },
      });
      console.timeEnd('create layout');

      console.time('create groups');
      await tx.cinemaLayoutGroup.createMany({
        data: item.layout_groups.map((group) => ({
          id: getNewGroupId(group.id),
          cinema_layout_id: newLayoutId,
          name: group.name,
          color_code: group.color_code,
          price: group.price,
        })),
      });
      console.timeEnd('create groups');
      */

    await this.ownershipService.createItem(async () => {
      const data = item.layout_seats.map((seat) => ({
        id: genId(),
        cinema_layout_id: newLayoutId,
        group_id: seat.group_id ? getNewGroupId(seat.group_id) : null,
        code: seat.code,
        x: seat.x,
        y: seat.y,
      }));
      await tx.cinemaLayoutSeat.createMany({
        data: data,
      });
      return data.map((seat) => ({
        item_id: seat.id,
        parent_id: seat.cinema_layout_id,
      }));
    });
    console.timeEnd('createMany seats');

    return {
      id: newLayoutId,
      rows: item.rows,
      columns: item.columns,
      groups: item.layout_groups.map((group) => ({
        id: binaryToUuid(group.id),
        name: group.name,
        color_code: group.color_code,
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

  private async getProviderId(account_id: Buffer) {
    //! Must have feature-flag guard in the controller to check if the user has the right role
    const { item_id } = await this.prismaService.ownership.findUniqueOrThrow({
      where: {
        owner_id: account_id,
        // role: {in: [BusinessRole.PROVIDER_ADMIN, BusinessRole.PROVIDER_MANAGER]}, // We dont need this (check comment bellow)
      },
      select: {
        item_id: true,
      },
    });
    // (We specified Flag "CREATE_CINEMA_LAYOUT", "DELETE_CINEMA_LAYOUT" in the controller), all flags are required role managing a provider, so item_id must be a provider_id
    // Except "UPDATE_CINEMA_LAYOUT" which is required role managing a provider or managing a cinema, but we are not using it in "deleteItem"
    // method so we can still not check the role here
    return item_id;
  }

  async getItems(query: QueryCinemaLayoutDto, account: TAccountRequest) {
    const conditions: Prisma.CinemaLayoutWhereInput = query.provider_id
      ? { cinema_provider_id: query.provider_id }
      : {};

    const [items, pagination] = genPaginationResponse({
      items: await this.prismaService.cinemaLayout.findMany({
        ...genPaginationParams(query, conditions),
        include: { layout_seats: true, layout_groups: true },
      }),
      total: await this.prismaService.cinemaLayout.count({ where: conditions }),
      query,
    });

    return {
      data: items.map((item) => ({
        id: binaryToUuid(item.id),
        provider_id: binaryToUuid(item.cinema_provider_id),
        rows: item.rows,
        columns: item.columns,
        seats: item.layout_seats.map((seat) => [seat.x, seat.y]),
      })),
      pagination,
    };
  }

  async getItem(id: Buffer, account: TAccountRequest) {
    const item = await this.prismaService.cinemaLayout.findUniqueOrThrow({
      where: { id },
      include: { layout_seats: true, layout_groups: true },
    });

    return {
      id: binaryToUuid(item.id),
      provider_id: binaryToUuid(item.cinema_provider_id),
      rows: item.rows,
      columns: item.columns,
      groups: item.layout_groups.map((group) => ({
        id: binaryToUuid(group.id),
        name: group.name,
        color_code: group.color_code,
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

  async createItem(body: CreateCinemaLayoutDto, account: TAccountRequest) {
    const provider_id = await this.getProviderId(account.id);
    await this.ownershipService.checkAccountHasAccess(provider_id, account.id);
    const hasAccessRoom = body.room_id
      ? await this.ownershipService.accountHasAccess(body.room_id, account.id)
      : false;

    if (body.room_id && !hasAccessRoom) {
      throw new UnauthorizedException('Permission denied');
    }

    const id = genId();

    await this.ownershipService.createItem(async () => {
      await this.prismaService.cinemaLayout.createMany({
        data: {
          id: id,
          cinema_provider_id: provider_id,
          cinema_room_id: body.room_id,
          rows: body.rows,
          columns: body.columns,
        },
      });
      return {
        item_id: id,
        parent_id: body.room_id ? body.room_id : provider_id,
      };
    });

    return {
      id: binaryToUuid(id),
      rows: body.rows,
      columns: body.columns,
    };
  }

  async cloneItem(body: CloneCinemaLayoutDto, account: TAccountRequest) {
    console.time('check permission');
    const provider_id = await this.getProviderId(account.id);

    console.log('layout_id', body.layout_id, 'provider_id', provider_id);
    // Check if the layout_id is a descendant of the provider_id
    await this.ownershipService.checkIsDescendantOf(
      body.layout_id,
      provider_id,
    );
    console.timeEnd('check permission');

    let item!: Awaited<ReturnType<typeof this.cloneLayout>>;
    await this.prismaService.$transaction(async (tx) => {
      item = await this.cloneLayout(tx, body.layout_id);
    });

    return {
      ...item,
      id: binaryToUuid(item.id),
    };
  }

  async updateItem(
    id: Buffer,
    body: UpdateCinemaLayoutDto,
    account: TAccountRequest,
  ) {
    await this.ownershipService.checkAccountHasAccess(id, account.id);

    const item = await this.prismaService.cinemaLayout.update({
      where: { id },
      data: {
        rows: body.rows,
        columns: body.columns,
      },
      select: {
        id: true,
        cinema_provider_id: true,
        rows: true,
        columns: true,
      },
    });

    return {
      id: binaryToUuid(item.id),
      provider_id: binaryToUuid(item.cinema_provider_id),
      rows: item.rows,
      columns: item.columns,
    };
  }

  async deleteItem(id: Buffer, account: TAccountRequest) {
    await this.ownershipService.checkAccountHasAccess(id, account.id);

    await this.ownershipService.deleteItem(async () => {
      await this.prismaService.cinemaLayout.deleteMany({
        where: { id },
      });
      return id;
    });
  }
}
