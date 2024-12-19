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
import { IdDto } from '@/shared/id.dto';
import { Roles } from '@/modules/account/decorators/roles.decorator';
import { AccountRole } from '@prisma/client';
import {
  AccountRequest,
  TAccountRequest,
} from '@/modules/account/decorators/AccountRequest.decorator';
import { QueryPickseatDto } from './dto/QueryPickseat.dto';

@Controller('pickseat')
@Roles([AccountRole.USER, AccountRole.BUSINESS])
export class PickseatController {
  constructor(private service: PickseatService) {}

  @Post()
  create(
    @Body() createFilmDto: CreatePickseatDto,
    @AccountRequest() account: TAccountRequest,
  ) {
    return this.service.createItem(createFilmDto, account);
  }

  // @Get(':id')
  // get(@Param() params: IdDto) {
  //   return this.service.getItem(params.id);
  // }

  @Get()
  getAll(
    @Query() query: QueryPickseatDto,
    @AccountRequest() account: TAccountRequest,
  ) {
    return this.service.getItems(query);
  }

  @Delete()
  delete(
    @Body() body: CreatePickseatDto,
    @AccountRequest() account: TAccountRequest,
  ) {
    return this.service.deleteItem(body, account);
  }
}
