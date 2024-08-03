import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { PickseatService } from './pickseat.service';
import { CreatePickseatDto } from './dto/CreatePickseat.dto';
import { IdDto } from 'src/shared/id.dto';
import { Roles } from 'src/account/decorators/roles.decorator';
import { AccountRole } from '@prisma/client';
import { Account } from 'src/account/decorators/Account.decorator';
import { SessionAccount } from 'src/account/dto/SessionAccount.dto';
import { QueryPickseatDto } from './dto/QueryPickseat.dto';

@Controller('pickseat')
@Roles([AccountRole.USER, AccountRole.MANAGER])
export class PickseatController {
  constructor(private service: PickseatService) {}

  @Post()
  @Roles([AccountRole.USER, AccountRole.MANAGER])
  create(
    @Body() createFilmDto: CreatePickseatDto,
    @Account() account: SessionAccount,
  ) {
    return this.service.createItem(account, createFilmDto);
  }

  // @Get(':id')
  // get(@Param() params: IdDto) {
  //   return this.service.getItem(params.id);
  // }

  @Get()
  getAll(@Query() query: QueryPickseatDto, @Account() account: SessionAccount) {
    return this.service.getItems(account, query);
  }

  @Delete()
  delete(@Body() body: CreatePickseatDto, @Account() account: SessionAccount) {
    return this.service.deleteItem(account, body);
  }
}
