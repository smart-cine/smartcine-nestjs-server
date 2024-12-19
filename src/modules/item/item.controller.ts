import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { IdDto } from '@/shared/id.dto';
import {
  AccountRequest,
  TAccountRequest,
} from '@/modules/account/decorators/AccountRequest.decorator';
import { ItemService } from './item.service';
import { QueryItemDto } from './dto/QueryItem.dto';
import { CreateItemDto } from './dto/CreateItem.dto';
import { UpdateItemDto } from './dto/UpdateItem.dto';
import { Roles } from '@/modules/account/decorators/roles.decorator';
import { AccountRole, FeatureFlag } from '@prisma/client';
import { Feature } from '@/modules/account/decorators/feature.decorator';

@Controller('item')
export class ItemController {
  constructor(private service: ItemService) {}

  @Get()
  async getItems(@Query() query: QueryItemDto) {
    return this.service.getItems(query);
  }

  @Feature(FeatureFlag.CREATE_ITEM)
  @Roles([AccountRole.BUSINESS])
  @Post()
  async createItem(
    @Body() body: CreateItemDto,
    @AccountRequest() account: TAccountRequest,
  ) {
    return this.service.createItem(body, account);
  }

  @Feature(FeatureFlag.UPDATE_ITEM)
  @Roles([AccountRole.BUSINESS])
  @Patch(':id')
  async updateItem(
    @Param() params: IdDto,
    @Body() body: UpdateItemDto,
    @AccountRequest() account: TAccountRequest,
  ) {
    return this.service.updateItem(params.id, body, account);
  }

  @Feature(FeatureFlag.DELETE_ITEM)
  @Roles([AccountRole.BUSINESS])
  @Delete(':id')
  async deleteItem(
    @Param() params: IdDto,
    @AccountRequest() account: TAccountRequest,
  ) {
    return this.service.deleteItem(params.id, account);
  }
}
