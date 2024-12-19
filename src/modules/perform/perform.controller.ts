import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PerformService } from './perform.service';
import { IdDto } from '@/shared/id.dto';
import { CreatePerformDto } from './dto/CreatePerform.dto';
import { UpdatePerformDto } from './dto/UpdatePerform.dto';

import {
  AccountRequest,
  TAccountRequest,
} from '@/modules/account/decorators/AccountRequest.decorator';
import { Roles } from '@/modules/account/decorators/roles.decorator';
import { AccountRole, FeatureFlag } from '@prisma/client';
import { Feature } from '@/modules/account/decorators/feature.decorator';
import { QueryPerformListCinemaDto } from './dto/QueryPerformListCinema.dto'
import { QueryPerformListFilmDto } from './dto/QueryPerformListFilm.dto'

@Controller('perform')
export class PerformController {
  constructor(private service: PerformService) {}

  // @Get('top')
  // getTopPerform(@Query() query: QueryTopPerformDto) {
  //   return this.service.getTopPerform(query);
  // }

  @Get('list-cinema')
  getAllListCinema(@Query() query: QueryPerformListCinemaDto) {
    return this.service.getItemsListCinema(query);
  }

  @Get('list-film')
  getAllListFilm(@Query() query: QueryPerformListFilmDto) {
    return this.service.getItemsListFilm(query);
  }

  @Get(':id')
  get(@Param() params: IdDto) {
    return this.service.getItem(params.id);
  }

  @Feature(FeatureFlag.CREATE_PERFORM)
  @Post()
  @Roles([AccountRole.BUSINESS])
  create(
    @Body() body: CreatePerformDto,
    @AccountRequest() account: TAccountRequest,
  ) {
    return this.service.createItem(body, account);
  }

  @Feature(FeatureFlag.UPDATE_PERFORM)
  @Patch(':id')
  @Roles([AccountRole.BUSINESS])
  update(
    @Param() params: IdDto,
    @Body() body: UpdatePerformDto,
    @AccountRequest() account: TAccountRequest,
  ) {
    return this.service.updateItem(params.id, body, account);
  }

  @Feature(FeatureFlag.DELETE_PERFORM)
  @Patch(':id')
  @Roles([AccountRole.BUSINESS])
  delete(@Param() params: IdDto, @AccountRequest() account: TAccountRequest) {
    return this.service.deleteItem(params.id, account);
  }
}
