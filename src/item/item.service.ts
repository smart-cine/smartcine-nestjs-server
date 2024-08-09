import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryItemDto } from './dto/QueryItem.dto';
import {
  genPaginationParams,
  genPaginationResponse,
} from 'src/pagination/pagination.util';
import { binaryToUuid } from 'src/utils/uuid';
import { SessionAccount } from 'src/account/dto/SessionAccount.dto';
import { CreateItemDto } from './dto/CreateItem.dto';
import { genId } from 'src/shared/genId';
import { IdDto } from 'src/shared/id.dto';
import { UpdateItemDto } from './dto/UpdateItem.dto';

@Injectable()
export class ItemService {
  constructor(private prismaService: PrismaService) {}

  async getItems(query: QueryItemDto) {
    const conditions = {};

    const [items, pagination] = genPaginationResponse({
      items: await this.prismaService.item.findMany({
        ...genPaginationParams(query),
        ...conditions,
        select: {
          id: true,
          name: true,
          price: true,
          discount: true,
        },
      }),
      total: await this.prismaService.item.count({ ...conditions }),
      query,
    });

    return {
      data: items.map((item) => ({
        id: binaryToUuid(item.id),
        name: item.name,
        price: item.price,
        discount: item.discount,
      })),
      pagination,
    };
  }

  async createItem(account: SessionAccount, body: CreateItemDto) {
    console.log(body, body);
    const item = await this.prismaService.item.create({
      data: {
        id: genId(),
        parent_id: body.parent_id,
        account_id: account.id,
        cinema_provider_id: body.cinema_provider_id,
        name: body.name,
        price: body.price,
        discount: body.discount,
      },
      select: {
        id: true,
        name: true,
        price: true,
        discount: true,
      },
    });

    return {
      id: binaryToUuid(item.id),
      name: item.name,
      price: item.price,
      discount: item.discount,
    };
  }

  async updateItem(
    account: SessionAccount,
    id: IdDto['id'],
    body: UpdateItemDto,
  ) {
    // TODO: Check if the item belongs to the business's provider

    const item = await this.prismaService.item.update({
      where: { id, account_id: account.id },
      data: {
        name: body.name,
        price: body.price,
        discount: body.discount,
      },
      select: {
        id: true,
        name: true,
        price: true,
        discount: true,
      },
    });

    return {
      id: binaryToUuid(item.id),
      name: item.name,
      price: item.price,
      discount: item.discount,
    };
  }

  async deleteItem(account: SessionAccount, id: IdDto['id']) {
    await this.prismaService.item.delete({
      where: { id, account_id: account.id },
    });
  }
}
