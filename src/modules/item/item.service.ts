import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { QueryItemDto } from './dto/QueryItem.dto';
import {
  genPaginationParams,
  genPaginationResponse,
} from 'src/common/pagination/pagination.util';
import { binaryToUuid } from 'src/utils/uuid';
import { CreateItemDto } from './dto/CreateItem.dto';
import { genId } from 'src/shared/genId';
import { UpdateItemDto } from './dto/UpdateItem.dto';
import { OwnershipService } from 'src/common/ownership/ownership.service';
import { TAccountRequest } from 'src/modules/account/decorators/AccountRequest.decorator';
import { Prisma } from '@prisma/client'

@Injectable()
export class ItemService {
  constructor(
    private prismaService: PrismaService,
    private ownershipService: OwnershipService,
  ) {}

  async getItems(query: QueryItemDto) {
    const conditions: Prisma.ItemWhereInput = {
      cinema_id: query.cinema_id,
    };

    const [items, pagination] = genPaginationResponse({
      items: await this.prismaService.item.findMany({
        ...genPaginationParams(query, conditions),
        select: {
          id: true,
          name: true,
          price: true,
          discount: true,
          image_url: true,
          items: {
            select: {
              id: true,
              name: true,
              price: true,
              discount: true,
              image_url: true,
            }
          },
        },
      }),
      total: await this.prismaService.item.count({ where: conditions }),
      query,
    });

    return {
      data: items.map((item) => ({
        id: binaryToUuid(item.id),
        name: item.name,
        price: item.price,
        discount: item.discount,
        image_url: item.image_url,
        items: item.items,
      })),
      pagination,
    };
  }

  async createItem(body: CreateItemDto, account: TAccountRequest) {
    await this.ownershipService.checkAccountHasAccess(
      body.cinema_id,
      account.id,
    );
    const id = genId();

    await this.ownershipService.createItem(async () => {
      await this.prismaService.item.createMany({
        data: {
          id: id,
          parent_id: body.parent_id,
          cinema_id: body.cinema_id,
          name: body.name,
          price: body.price,
          discount: body.discount,
          image_url: body.image_url,
        },
      });
      return {
        item_id: id,
        parent_id: body.cinema_id,
      };
    });

    return {
      id: binaryToUuid(id),
      name: body.name,
      price: body.price,
      discount: body.discount,
    };
  }

  async updateItem(id: Uint8Array, body: UpdateItemDto, account: TAccountRequest) {
    await this.ownershipService.checkAccountHasAccess(id, account.id);

    const item = await this.prismaService.item.update({
      where: { id },
      data: {
        name: body.name,
        price: body.price,
        discount: body.discount,
      },
    });

    return {
      id: binaryToUuid(item.id),
      name: item.name,
      price: item.price,
      discount: item.discount,
    };
  }

  async deleteItem(id: Uint8Array, account: TAccountRequest) {
    await this.ownershipService.checkAccountHasAccess(id, account.id);

    await this.ownershipService.deleteItem(async () => {
      await this.prismaService.item.deleteMany({
        where: { id },
      });
      return id;
    });
  }
}
