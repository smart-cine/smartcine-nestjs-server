import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { TagService } from './tag.service';
import { QueryTagDto } from './dto/QueryTag.dto';
import { CreateTagDto } from './dto/CreateTag.dto';
import { DeleteTagDto } from './dto/DeleteTag.dto';
import { Feature } from '@/modules/account/decorators/feature.decorator';
import { AccountRole, FeatureFlag } from '@prisma/client';
import {
  AccountRequest,
  TAccountRequest,
} from '@/modules/account/decorators/AccountRequest.decorator';
import { Roles } from '@/modules/account/decorators/roles.decorator';

@Controller('tag')
export class TagController {
  constructor(private service: TagService) {}

  @Get()
  async getItems(@Query() query: QueryTagDto) {
    return this.service.getItems(query);
  }

  @Feature(FeatureFlag.ADD_TAG)
  @Roles([AccountRole.BUSINESS])
  @Post()
  async createItem(
    @Body() body: CreateTagDto,
    @AccountRequest() account: TAccountRequest,
  ) {
    return this.service.createItem(body, account);
  }

  @Feature(FeatureFlag.REMOVE_TAG)
  @Roles([AccountRole.BUSINESS])
  @Delete()
  async deleteItem(
    @Body() body: DeleteTagDto,
    @AccountRequest() account: TAccountRequest,
  ) {
    return this.service.deleteItem(body, account);
  }
}
