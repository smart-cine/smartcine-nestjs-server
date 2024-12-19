import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryCinemaRoomDto } from './dto/QueryCinemaRoom.dto';
import {
  genPaginationParams,
  genPaginationResponse,
} from 'src/pagination/pagination.util';
import { binaryToUuid } from 'src/utils/uuid';
import { IdDto } from 'src/shared/id.dto';
import { CreateCinemaRoomDto } from './dto/CreateCinemaRoom.dto';
import { genId } from 'src/shared/genId';
import { UpdateCinemaRoomDto } from './dto/UpdateCinemaRoom.dto';
import { OwnershipService } from 'src/ownership/ownership.service';
import { TAccountRequest } from 'src/account/decorators/AccountRequest.decorator';
import { CinemaLayoutService } from 'src/cinema-layout/cinema-layout.service';

@Injectable()
export class CinemaRoomService {
  constructor(
    private prismaService: PrismaService,
    private ownershipService: OwnershipService,
    private cinemaLayoutService: CinemaLayoutService,
  ) {}

  async getItems(query: QueryCinemaRoomDto) {
    const conditions = {
      where: query.cinema_id ? { cinema_id: query.cinema_id } : {},
    };

    const [items, pagination] = genPaginationResponse({
      items: await this.prismaService.cinemaRoom.findMany({
        ...genPaginationParams(query),
        ...conditions,
      }),
      total: await this.prismaService.cinemaRoom.count({ ...conditions }),
      query,
    });

    return {
      data: items.map((item) => ({
        id: binaryToUuid(item.id),
        cinema_id: binaryToUuid(item.cinema_id),
        name: item.name,
      })),
      pagination,
    };
  }

  async getItem(id: Buffer) {
    const item = await this.prismaService.cinemaRoom.findUniqueOrThrow({
      where: { id },
      include: {
        layout: {
          include: {
            layout_seats: true,
            layout_groups: true,
          },
        },
      },
    });

    return {
      id: binaryToUuid(item.id),
      cinema_id: binaryToUuid(item.cinema_id),
      name: item.name,
      layout: item.layout
        ? {
            rows: item.layout.rows,
            columns: item.layout.columns,
            seats: item.layout.layout_seats.map((seat) => ({
              id: binaryToUuid(seat.id),
              group_id: binaryToUuid(seat.group_id),
              code: seat.code,
              x: seat.x,
              y: seat.y,
            })),
            groups: item.layout.layout_groups.map((group) => ({
              id: binaryToUuid(group.id),
              name: group.name,
              color_code: group.color_code,
              price: group.price,
            })),
          }
        : null,
    };
  }

  async createItem(body: CreateCinemaRoomDto, account: TAccountRequest) {
    await this.ownershipService.checkAccountHasAccess(
      body.cinema_id,
      account.id,
    );

    let cinema_layout_id!: Buffer;
    const room_id = genId();

    await this.prismaService.$transaction(async (tx) => {
      // await this.ownershipService.createItem(async () => {

      //   return {
      //     item_id: room_id,
      //     parent_id: body.cinema_id,
      //   };
      // });

      await tx.cinemaRoom.createMany({
        data: {
          id: room_id,
          cinema_id: body.cinema_id,
          name: body.name,
        },
      });

      if (body.cinema_layout_id) {
        // Clone that layout to the new room
        const layout = await this.cinemaLayoutService.cloneLayout(
          tx,
          body.cinema_layout_id,
          room_id,
        );
        cinema_layout_id = layout.id;
      } else {
        if (!body.rows || !body.columns) {
          throw new Error('Rows and columns are required');
        }
        // Create a new layout for the room
        const { cinema_provider_id } = await tx.cinema.findUniqueOrThrow({
          where: { id: body.cinema_id },
          select: { cinema_provider_id: true },
        });

        cinema_layout_id = genId();

        await tx.cinemaRoom.create({
          data: {
            id: room_id,
            cinema_id: body.cinema_id,
            name: body.name,
            layout: {
              create: {
                id: cinema_layout_id,
                cinema_provider_id: cinema_provider_id,
                rows: body.rows,
                columns: body.columns,
              },
            },
          },
          select: { id: true },
        });
      }
    });

    return {
      id: binaryToUuid(room_id),
      cinema_id: binaryToUuid(body.cinema_id),
      cinema_layout_id: binaryToUuid(cinema_layout_id),
      name: body.name,
    };
  }

  async updateItem(
    id: Buffer,
    body: UpdateCinemaRoomDto,
    account: TAccountRequest,
  ) {
    await this.ownershipService.checkAccountHasAccess(id, account.id);

    const item = await this.prismaService.cinemaRoom.update({
      where: { id },
      data: {
        name: body.name,
      },
    });

    return {
      id: binaryToUuid(item.id),
      cinema_id: binaryToUuid(item.cinema_id),
      name: item.name,
    };
  }

  async deleteItem(id: Buffer, account: TAccountRequest) {
    await this.ownershipService.checkAccountHasAccess(id, account.id);
    await this.prismaService.cinemaRoom.deleteMany({ where: { id } });
  }
}
