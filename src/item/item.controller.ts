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
import { IdDto } from 'src/shared/id.dto';
import { AccountRequest } from 'src/account/decorators/AccountRequest.decorator';
import { SessionAccount } from 'src/account/dto/SessionAccount.dto';
import { ItemService } from './item.service';
import { QueryItemDto } from './dto/QueryItem.dto';
import { CreateItemDto } from './dto/CreateItem.dto';
import { UpdateItemDto } from './dto/UpdateItem.dto';
import { Roles } from 'src/account/decorators/roles.decorator';
import { AccountRole } from '@prisma/client';

@Controller('item')
@Roles([AccountRole.BUSINESS, AccountRole.USER])
export class ItemController {
  constructor(private service: ItemService) {}

  @Get()
  async getItems(@Query() query: QueryItemDto) {
    return this.service.getItems(query);
  }

  @Roles([AccountRole.BUSINESS])
  @Post()
  async createItem(
    @Body() body: CreateItemDto,
    @AccountRequest() account: SessionAccount,
  ) {
    return this.service.createItem(account, body);
  }

  @Roles([AccountRole.BUSINESS])
  @Patch(':id')
  async updateItem(
    @Param() params: IdDto,
    @Body() body: UpdateItemDto,
    @AccountRequest() account: SessionAccount,
  ) {
    return this.service.updateItem(account, params.id, body);
  }

  @Roles([AccountRole.BUSINESS])
  @Delete(':id')
  async deleteItem(
    @Param() params: IdDto,
    @AccountRequest() account: SessionAccount,
  ) {
    return this.service.deleteItem(account, params.id);
  }
}
