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
import { CinemaLayoutService } from './cinema-layout.service';
import { QueryCinemaLayoutDto } from './dto/QueryCinemaLayout.dto';
import { IdDto } from 'src/shared/id.dto';
import { CreateCinemaLayoutDto } from './dto/CreateCinemaLayout.dto';
import { Account } from 'src/account/decorators/Account.decorator';
import { SessionAccount } from 'src/account/dto/SessionAccount.dto';
import { UpdateCinemaLayoutDto } from './dto/UpdateCinemaLayout.dto';
import { Roles } from 'src/account/decorators/roles.decorator';
import { AccountRole } from '@prisma/client';

@Controller('cinema-layout')
@Roles([AccountRole.USER, AccountRole.MANAGER])
export class CinemaLayoutController {
  constructor(private service: CinemaLayoutService) {}

  @Get()
  async getItems(@Query() query: QueryCinemaLayoutDto) {
    return this.service.getItems(query);
  }

  @Get(':id')
  async getItem(@Param() params: IdDto) {
    return this.service.getItem(params.id);
  }

  @Post()
  async createItem(
    @Body() body: CreateCinemaLayoutDto,
    @Account() account: SessionAccount,
  ) {
    return this.service.createItem(account, body);
  }

  @Patch(':id')
  async updateItem(
    @Param() params: IdDto,
    @Body() body: UpdateCinemaLayoutDto,
  ) {
    return this.service.updateItem(params.id, body);
  }

  @Delete(':id')
  async deleteItem(@Param() params: IdDto) {
    return this.service.deleteItem(params.id);
  }
}
