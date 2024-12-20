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
import { FilmService } from './film.service';
import { CreateFilmDto } from './dto/CreateFilm.dto';
import { UpdateFilmDto } from './dto/UpdateFilm.dto';
import { IdDto } from '@/shared/id.dto';
import { PaginationQueryDto } from '@/common/pagination/PaginationQuery.dto';
import {
  AccountRequest,
  TAccountRequest,
} from '@/modules/account/decorators/AccountRequest.decorator';
import { Roles } from '@/modules/account/decorators/roles.decorator';
import { AccountRole, FeatureFlag } from '@prisma/client';
import { Feature } from '@/modules/account/decorators/feature.decorator';

@Controller('film')
export class FilmController {
  constructor(public service: FilmService) {}

  @Roles([AccountRole.BUSINESS, AccountRole.USER])
  @Get()
  async getItems(@Query() query: PaginationQueryDto) {
    return this.service.getItems(query);
  }

  @Roles([AccountRole.BUSINESS, AccountRole.USER])
  @Get('top')
  async getTopItems(@Query() query: PaginationQueryDto) {
    return this.service.getTopItems(query);
  } 

  @Roles([AccountRole.BUSINESS, AccountRole.USER])
  @Get(':id')
  async getItem(@Param() params: IdDto) {
    return this.service.getItem(params.id);
  }

  @Feature(FeatureFlag.CREATE_FILM)
  @Roles([AccountRole.BUSINESS])
  @Post()
  async createItem(
    @Body() createFilmDto: CreateFilmDto,
    @AccountRequest() account: TAccountRequest,
  ) {
    return this.service.createItem(createFilmDto, account);
  }

  @Feature(FeatureFlag.UPDATE_FILM)
  @Roles([AccountRole.BUSINESS])
  @Patch(':id')
  async updateItem(
    @Param() params: IdDto,
    @Body() updateFilmDto: UpdateFilmDto,
    @AccountRequest() account: TAccountRequest,
  ) {
    return this.service.updateItem(params.id, updateFilmDto, account);
  }

  @Feature(FeatureFlag.DELETE_FILM)
  @Roles([AccountRole.BUSINESS])
  @Delete(':id')
  async deleteItem(
    @Param() params: IdDto,
    @AccountRequest() account: TAccountRequest,
  ) {
    return this.service.deleteItem(params.id, account);
  }
}
