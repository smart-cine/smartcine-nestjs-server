import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { binaryToUuid } from 'src/utils/uuid';
import { UpdateCinemaLayoutGroupDto } from './dto/UpdateCinemaLayoutGroup.dto';
import { CreateCinemaLayoutGroupDto } from './dto/CreateCinemaLayoutGroup.dto';
import { genId } from 'src/shared/genId';
import { OwnershipService } from 'src/common/ownership/ownership.service';
import { TAccountRequest } from 'src/modules/account/decorators/AccountRequest.decorator';

@Injectable()
export class CinemaLayoutGroupService {
  constructor(
    private prismaService: PrismaService,
    private ownershipService: OwnershipService,
  ) {}

  async createItem(body: CreateCinemaLayoutGroupDto, account: TAccountRequest) {
    await this.ownershipService.checkAccountHasAccess(
      body.layout_id,
      account.id,
    );

    const id = genId();

    await this.ownershipService.createItem(async () => {
      await this.prismaService.cinemaLayoutGroup.createMany({
        data: {
          id: id,
          cinema_layout_id: body.layout_id,
          name: body.name,
          color_code: body.color_code,
          price: body.price,
        },
      });
      return {
        item_id: id,
        parent_id: body.layout_id,
      };
    });

    return {
      id: binaryToUuid(id),
      cinema_layout_id: binaryToUuid(body.layout_id),
      name: body.name,
      color_code: body.color_code,
      price: body.price,
    };
  }

  async updateItem(
    id: Uint8Array,
    body: UpdateCinemaLayoutGroupDto,
    account: TAccountRequest,
  ) {
    await this.ownershipService.checkAccountHasAccess(id, account.id);

    const item = await this.prismaService.cinemaLayoutGroup.update({
      where: { id },
      data: {
        name: body.name,
        color_code: body.color_code,
        price: body.price,
      },
      select: {
        id: true,
        cinema_layout_id: true,
        name: true,
        color_code: true,
        price: true,
      },
    });

    return {
      id: binaryToUuid(item.id),
      cinema_layout_id: binaryToUuid(item.cinema_layout_id),
      name: item.name,
      color_code: item.color_code,
      price: item.price,
    };
  }

  async deleteItem(id: Uint8Array, account: TAccountRequest) {
    await this.ownershipService.checkAccountHasAccess(id, account.id);
    await this.ownershipService.deleteItem(async () => {
      await this.prismaService.cinemaLayoutGroup.deleteMany({ where: { id } });
      return id;
    });
  }
}
