import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCommentDto } from './dto/CreateComment.dto';
import { binaryToUuid } from 'src/utils/uuid';
import { CommentType } from '@prisma/client';
import { SessionAccount } from 'src/account/dto/SessionAccount.dto';
import { QueryCommentDto } from './dto/QueryComment.dto';
import { IdDto } from 'src/shared/id.dto';
import {
  genPaginationParams,
  genPaginationResponse,
} from 'src/pagination/pagination.util';
import { genId } from 'src/shared/genId';
import { UpdateCommentDto } from './dto/UpdateComment.dto';

@Injectable()
export class CommentService {
  constructor(private prismaService: PrismaService) {}

  getDestObject(type: CommentType, dest_id: Buffer) {
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
        body: item.body,
        rating: {
          score:
            item.ratings.reduce((acc, rating) => acc + rating.score, 0) /
            item.ratings.length,
          amount: item.ratings.length,
        },
      })),
      pagination,
    };
  }

  async getItem(id: IdDto['id']) {
    const item = await this.prismaService.comment.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        body: true,
        ratings: {
          select: {
            score: true,
          },
        },
        comments: {
          select: {
            id: true,
            body: true,
          },
        },
      },
    });

    return {
      id: binaryToUuid(item.id),
      body: item.body,
      rating: {
        score:
          item.ratings.reduce((acc, rating) => acc + rating.score, 0) /
          item.ratings.length,
        amount: item.ratings.length,
      },
      children: item.comments.map((comment) => ({
        id: binaryToUuid(comment.id),
        body: comment.body,
      })),
    };
  }

  async createItem(account: SessionAccount, body: CreateCommentDto) {
    const item = await this.prismaService.comment.create({
      data: {
        id: genId(),
        account_id: account.id,
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

  async updateItem(id: IdDto['id'], body: UpdateCommentDto) {
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

  async deleteItem(id: IdDto['id']) {
    await this.prismaService.comment.delete({
      where: { id },
    });
  }
}
