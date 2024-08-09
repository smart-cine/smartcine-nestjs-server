import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryRatingDto } from './dto/QueryRating.dto';
import { RatingType } from '@prisma/client';
import {
  genPaginationParams,
  genPaginationResponse,
} from 'src/pagination/pagination.util';
import { IdDto } from 'src/shared/id.dto';
import { binaryToUuid } from 'src/utils/uuid';
import { SessionAccount } from 'src/account/dto/SessionAccount.dto';
import { CreateRatingDto } from './dto/CreateRating.dto';
import { genId } from 'src/shared/genId';
import { UpdateRating } from './dto/UpdateRating.dto';

@Injectable()
export class RatingService {
  constructor(private prismaService: PrismaService) {}

  getDestObject(type: RatingType, dest_id: Buffer) {
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

  async createItem(account: SessionAccount, body: CreateRatingDto) {
    const item = await this.prismaService.rating.create({
      data: {
        id: genId(),
        account_id: account.id,
        score: body.score,
        type: body.type,
        ...this.getDestObject(body.type, body.dest_id),
      },
      select: {
        id: true,
        score: true,
      },
    });

    return {
      id: binaryToUuid(item.id),
      score: item.score,
    };
  }

  async updateItem(
    account: SessionAccount,
    id: IdDto['id'],
    body: UpdateRating,
  ) {
    const item = await this.prismaService.rating.update({
      where: { id, account_id: account.id },
      data: {
        score: body.score,
      },
      select: {
        id: true,
        score: true,
      },
    });

    return {
      id: binaryToUuid(item.id),
      score: item.score,
    };
  }

  async deleteItem(account: SessionAccount, id: IdDto['id']) {
    await this.prismaService.rating.delete({
      where: { id, account_id: account.id },
    });
  }
}
