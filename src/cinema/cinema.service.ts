import { accessibleBy } from '@casl/prisma';
import { binaryToUuid } from 'src/utils/uuid';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryCinemaDto } from './dto/QueryCinema.dto';
import {
  genPaginationParams,
  genPaginationResponse,
} from 'src/pagination/pagination.util';
import { CreateCinemaDto } from './dto/CreateCinema.dto';
import { genId } from 'src/shared/genId';
import { UpdateCinemaDto } from './dto/UpdateCinema.dto';
import { TAccountRequest } from 'src/account/decorators/AccountRequest.decorator';
import { CinemaProviderService } from 'src/cinema-provider/cinema-provider.service';
import { BusinessRole, Prisma } from '@prisma/client';
import { OwnershipService } from 'src/ownership/ownership.service';

@Injectable()
export class CinemaService {
  constructor(
    private prismaService: PrismaService,
    private ownershipService: OwnershipService,
    private cinemaProviderService: CinemaProviderService,
  ) {}

  private async getProviderId(account_id: Buffer) {
    //! Must have feature-flag guard in the controller to check if the user has the right role
    const { item_id } = await this.prismaService.ownership.findUniqueOrThrow({
      where: {
        owner_id: account_id,
      },
      select: {
        item_id: true,
      },
    });
    // Because we are using feature-flag guard in the controller so we don't need to check the role here, item_id is always a provider_id
    return item_id;
  }

  async getItems(query: QueryCinemaDto) {
    const conditions: Prisma.CinemaWhereInput = query.provider_id
      ? { cinema_provider_id: query.provider_id }
      : {};

    const [items, pagination] = genPaginationResponse({
      items: await this.prismaService.cinema.findMany({
        ...genPaginationParams(query, conditions),
      }),
      total: await this.prismaService.cinema.count({ where: conditions }),
      query,
    });

    return {
      data: items.map((item) => ({
        id: binaryToUuid(item.id),
        cinema_provider_id: binaryToUuid(item.cinema_provider_id),
        name: item.name,
        address: item.address,
      })),
      pagination,
    };
  }

  async getItem(id: Buffer) {
    const item = await this.prismaService.cinema.findUniqueOrThrow({
      where: { id },
    });

    return {
      id: binaryToUuid(item.id),
      cinema_provider_id: binaryToUuid(item.cinema_provider_id),
      name: item.name,
      address: item.address,
    };
  }

  async createItem(body: CreateCinemaDto, account: TAccountRequest) {
    const provider_id = await this.getProviderId(account.id);
    await this.ownershipService.checkAccountHasAccess(provider_id, account.id);

    const id = genId();

    await this.ownershipService.createItem(async () => {
      await this.prismaService.cinema.createMany({
        data: {
          id,
          name: body.name,
          address: body.address,
          cinema_provider_id: provider_id,
        },
      });
      return {
        item_id: id,
        parent_id: provider_id,
      };
    });

    return {
      id: binaryToUuid(id),
      name: body.name,
      address: body.address,
    };
  }

  async updateItem(
    id: Buffer,
    body: UpdateCinemaDto,
    account: TAccountRequest,
  ) {
    await this.ownershipService.checkAccountHasAccess(id, account.id);

    const item = await this.prismaService.cinema.update({
      where: {
        id,
      },
      data: {
        name: body.name,
        address: body.address,
      },
      select: {
        id: true,
        cinema_provider_id: true,
        name: true,
        address: true,
      },
    });

    return {
      id: binaryToUuid(item.id),
      cinema_provider_id: binaryToUuid(item.cinema_provider_id),
      name: item.name,
      address: item.address,
    };
  }

  async deleteItem(id: Buffer, account: TAccountRequest) {
    await this.ownershipService.checkAccountHasAccess(id, account.id);
    await this.ownershipService.deleteItem(async () => {
      await this.prismaService.cinema.deleteMany({
        where: {
          id,
        },
      });
      return id;
    });
  }
}
