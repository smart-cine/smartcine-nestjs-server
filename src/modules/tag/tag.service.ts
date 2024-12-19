import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { QueryTagDto } from './dto/QueryTag.dto';
import { CreateTagDto } from './dto/CreateTag.dto';
import { DeleteTagDto } from './dto/DeleteTag.dto';
import { OwnershipService } from '@/common/ownership/ownership.service';
import { TAccountRequest } from '@/modules/account/decorators/AccountRequest.decorator';

@Injectable()
export class TagService {
  constructor(
    private prismaService: PrismaService,
    private ownershipService: OwnershipService,
  ) {}

  async getItems(query: QueryTagDto) {
    const items = await this.prismaService.filmsOnTags.findMany({
      where: {
        film_id: query.film_id,
      },
      include: {
        tag: true,
      },
    });

    return items.map((item) => item.tag.name);
  }

  async createItem(body: CreateTagDto, account: TAccountRequest) {
    await this.ownershipService.accountHasAccess(body.film_id, account.id);

    await this.prismaService.tag.createMany({
      data: body.tags.map((tag) => ({
        name: tag,
      })),
      skipDuplicates: true,
    });

    await this.prismaService.filmsOnTags.createMany({
      data: body.tags.map((tag) => ({
        film_id: body.film_id,
        tag_id: tag,
      })),
      skipDuplicates: true,
    });
  }

  async deleteItem(body: DeleteTagDto, account: TAccountRequest) {
    await this.ownershipService.checkAccountHasAccess(body.film_id, account.id);

    await this.prismaService.filmsOnTags.deleteMany({
      where: {
        film_id: body.film_id,
        tag_id: {
          in: body.tags,
        },
      },
    });
  }
}
