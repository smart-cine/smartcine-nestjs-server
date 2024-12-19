import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateCommentDto } from './dto/CreateComment.dto';
import { binaryToUuid } from '@/utils/uuid';
import { CommentType } from '@prisma/client';
import { QueryCommentDto } from './dto/QueryComment.dto';
import { IdDto } from '@/shared/id.dto';
import {
  genPaginationParams,
  genPaginationResponse,
} from '@/common/pagination/pagination.util';
import { genId } from '@/shared/genId';
import { UpdateCommentDto } from './dto/UpdateComment.dto';

@Injectable()
export class CommentService {
  constructor(private prismaService: PrismaService) {}

  getDestObject(type: CommentType, dest_id: Uint8Array) {
    if (type === CommentType.CINEMA_PROVIDER) {
      return {
        dest_cinema_provider_id: dest_id,
      };
    }

    if (type === CommentType.FILM) {
      return {
        dest_film_id: dest_id,
      };
    }

    if (type === CommentType.COMMENT) {
      return {
        dest_comment_id: dest_id,
      };
    }

    throw new Error('Invalid comment type');
  }

  async getItems(query: QueryCommentDto) {
    const conditions = {
      where: {
        ...this.getDestObject(query.type, query.dest_id),
        type: query.type,
      },
    };

    const [items, pagination] = genPaginationResponse({
      items: await this.prismaService.comment.findMany({
        ...genPaginationParams(query),
        ...conditions,
        select: {
          id: true,
          account: {
            select: {
              id: true,
              name: true,
              avatar_url: true,
            },
          },
          body: true,
          ratings: {
            select: {
              score: true,
            },
          },
        },
      }),
      total: await this.prismaService.comment.count({ ...conditions }),
      query,
    });

    return {
      data: items.map((item) => ({
        id: binaryToUuid(item.id),
        account: {
          id: binaryToUuid(item.account.id),
          name: item.account.name,
          avatar_url: item.account.avatar_url,
        },
        body: item.body,
        rating: {
          score:
            item.ratings.reduce((acc, rating) => acc + rating.score, 0) /
            item.ratings.length,
          count: item.ratings.length,
        },
        children: [],
      })),
      pagination,
    };
  }

  async getItem(id: Uint8Array) {
    const item = await this.prismaService.comment.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        account: {
          select: {
            id: true,
            name: true,
            avatar_url: true,
          }
        },
        body: true,
        ratings: {
          select: {
            score: true,
          },
        },
        comments: {
          select: {
            id: true,
            account_id: true,
            body: true,
          },
        },
      },
    });

    return {
      id: binaryToUuid(item.id),
      account: {
        id: binaryToUuid(item.account.id),
        name: item.account.name,
        avatar_url: item.account.avatar_url,
      },
      body: item.body,
      rating: {
        score:
          item.ratings.reduce((acc, rating) => acc + rating.score, 0) /
          item.ratings.length,
        count: item.ratings.length,
      },
      children: item.comments.map((comment) => ({
        id: binaryToUuid(comment.id),
        account_id: binaryToUuid(comment.account_id),
        body: comment.body,
      })),
    };
  }

  async createItem(account_id: Uint8Array, body: CreateCommentDto) {
    const item = await this.prismaService.comment.create({
      data: {
        id: genId(),
        account_id,
        type: body.type,
        body: body.body,
        ...this.getDestObject(body.type, body.dest_id),
      },
      select: {
        id: true,
        body: true,
      },
    });

    return {
      id: binaryToUuid(item.id),
      body: item.body,
    };
  }

  async updateItem(id: Uint8Array, body: UpdateCommentDto) {
    const item = await this.prismaService.comment.update({
      where: { id },
      data: {
        body: body.body,
      },
      select: {
        id: true,
        body: true,
      },
    });

    return {
      id: binaryToUuid(item.id),
      body: item.body,
    };
  }

  async deleteItem(id: Uint8Array) {
    await this.prismaService.comment.delete({
      where: { id },
    });
  }
}
