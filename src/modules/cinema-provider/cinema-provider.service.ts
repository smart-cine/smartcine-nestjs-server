import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { binaryToUuid } from '@/utils/uuid';
import { CreateCinemaProviderDto } from './dto/CreateCinemaProvider.dto';
import { genId } from '@/shared/genId';
import { UpdateCinemaProviderDto } from './dto/UpdateCinemaProvider.dto';
import { QueryCinemaProviderDto } from './dto/QueryCinemaProvider.dto';
import {
  genPaginationParams,
  genPaginationResponse,
} from '@/common/pagination/pagination.util';
import { TAccountRequest } from '@/modules/account/decorators/AccountRequest.decorator';
import { OwnershipService } from '@/common/ownership/ownership.service';
import { BusinessRole, Prisma } from '@prisma/client';
import { isEqualBytes } from '@/utils/common'

@Injectable()
export class CinemaProviderService {
  constructor(private prismaService: PrismaService) {}

  private async getProviderId(account_id: Uint8Array) {
    const query = await this.prismaService.ownership.findFirst({
      where: {
        owner_id: account_id,
        role: {
          in: [BusinessRole.PROVIDER_ADMIN, BusinessRole.PROVIDER_MANAGER],
        },
      },
      select: {
        item_id: true,
      },
    });
    // Because we specified the provider roles in the query, so item_id is always a provider_id
    return query?.item_id;
  }

  async getItems(query: QueryCinemaProviderDto) {
    const conditions: Prisma.CinemaProviderWhereInput = {
      
    };

    const [items, pagination] = genPaginationResponse({
      items: await this.prismaService.cinemaProvider.findMany({
        ...genPaginationParams(query, conditions),
        include: {
          ratings: {
            select: {
              score: true,
            },
          },
        }
      }),
      total: await this.prismaService.cinemaProvider.count({where: conditions}),
      query,
    });

    // TODO: bad performance, need to optimize by using redis
    const cinema_counts = await this.prismaService.cinema.groupBy({
      by: ['cinema_provider_id'],
      _count: {
        id: true,
      },
    });

    return {
      data: items.map((item) => ({
        id: binaryToUuid(item.id),
        name: item.name,
        logo_url: item.logo_url,
        background_url: item.background_url,
        country: item.country,
        cinema_count: cinema_counts.find(
          (count) => isEqualBytes(count.cinema_provider_id, item.id),
        )?._count.id || 0,
        rating: {
          score:
            item.ratings.reduce((acc, curr) => acc + curr.score, 0) /
              item.ratings.length || 0,
          count: item.ratings.length,
        },
      })),
      pagination,
    };
  }

  async getItem(id: Uint8Array) {
    const item = await this.prismaService.cinemaProvider.findUniqueOrThrow({
      where: { id },
      include: {
        ratings: {
          select: {
            score: true,
          },
        },
      },
    });

    return {
      id: binaryToUuid(item.id),
      name: item.name,
      logo_url: item.logo_url,
      background_url: item.background_url,
      country: item.country,
      cinema_count: await this.prismaService.cinema.count({
        where: {
          cinema_provider_id: item.id,
        },
      }),
      rating: {
        score:
          item.ratings.reduce((acc, curr) => acc + curr.score, 0) /
            item.ratings.length || 0,
        count: item.ratings.length,
      },
    };
  }

  async createItem(account: TAccountRequest, body: CreateCinemaProviderDto) {
    const provider_id = await this.getProviderId(account.id);
    if (provider_id) {
      throw new Error('You already have a provider');
    }

    const id = genId();
    await this.prismaService.cinemaProvider.createMany({
      data: {
        id,
        name: body.name,
        logo_url: body.logo_url,
        background_url: body.background_url,
        country: body.country,
      },
    });
    await this.prismaService.ownership.createMany({
      data: {
        item_id: id,
        owner_id: account.id,
        role: BusinessRole.PROVIDER_ADMIN,
      },
    });

    return {
      id: binaryToUuid(id),
      name: body.name,
      logo_url: body.logo_url,
      background_url: body.background_url,
    };
  }

  async updateItem(body: UpdateCinemaProviderDto, account: TAccountRequest) {
    const provider_id = await this.getProviderId(account.id);
    if (!provider_id) {
      throw new Error('You are not managing any provider');
    }

    const item = await this.prismaService.cinemaProvider.update({
      where: {
        id: provider_id,
      },
      data: {
        name: body.name,
        logo_url: body.logo_url,
        background_url: body.background_url,
      },
    });

    return {
      id: binaryToUuid(item.id),
      name: item.name,
      logo_url: item.logo_url,
      background_url: item.background_url,
    };
  }

  async deleteItem(account: TAccountRequest) {
    const provider_id = await this.getProviderId(account.id);
    if (!provider_id) {
      throw new Error('You are not managing any provider');
    }

    await this.prismaService.cinemaProvider.deleteMany({
      where: {
        id: provider_id,
      },
    });
  }
}
