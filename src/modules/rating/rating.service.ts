import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { QueryRatingDto } from './dto/QueryRating.dto';
import { RatingType } from '@prisma/client';
import {
  genPaginationParams,
  genPaginationResponse,
} from '@/common/pagination/pagination.util';
import { IdDto } from '@/shared/id.dto';
import { binaryToUuid } from '@/utils/uuid';
import { CreateRatingDto } from './dto/CreateRating.dto';
import { genId } from '@/shared/genId';
import { UpdateRating } from './dto/UpdateRating.dto';
import { TAccountRequest } from '@/modules/account/decorators/AccountRequest.decorator';

@Injectable()
export class RatingService {
  constructor(private prismaService: PrismaService) {}

  getDestObject(type: RatingType, dest_id: Uint8Array) {
    if (type === RatingType.CINEMA_PROVIDER) {
      return {
        dest_cinema_provider_id: dest_id,
      };
    }

    if (type === RatingType.FILM) {
      return {
        dest_film_id: dest_id,
      };
    }

    if (type === RatingType.COMMENT) {
      return {
        dest_comment_id: dest_id,
      };
    }

    throw new Error('Invalid comment type');
  }

  async getItems(query: QueryRatingDto) {
    const conditions = {
      where: {
        ...this.getDestObject(query.type, query.dest_id),
        type: query.type,
      },
    };

    const [items, pagination] = genPaginationResponse({
      items: await this.prismaService.rating.findMany({
        ...genPaginationParams(query),
        ...conditions,
        select: {
          id: true,
          score: true,
          account: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      total: await this.prismaService.rating.count({ ...conditions }),
      query,
    });

    return {
      data: items.map((item) => ({
        id: binaryToUuid(item.id),
        score: item.score,
        account: {
          id: binaryToUuid(item.account.id),
          name: item.account.name,
        },
      })),
      pagination,
    };
  }

  async createItem(body: CreateRatingDto, account: TAccountRequest) {
    const id = genId();

    await this.prismaService.rating.createMany({
      data: {
        id: id,
        account_id: account.id,
        score: body.score,
        type: body.type,
        ...this.getDestObject(body.type, body.dest_id),
      },
    });

    return {
      id: binaryToUuid(id),
      score: body.score,
    };
  }

  async updateItem(id: Uint8Array, body: UpdateRating, account: TAccountRequest) {
    await this.prismaService.rating.updateMany({
      where: { id, account_id: account.id },
      data: {
        score: body.score,
      },
    });

    return {
      id: binaryToUuid(id),
      score: body.score,
    };
  }

  async deleteItem(id: Uint8Array, account: TAccountRequest) {
    await this.prismaService.rating.delete({
      where: { id, account_id: account.id },
    });
  }
}
