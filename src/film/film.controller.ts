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
import { IdDto } from 'src/shared/id.dto';
import { PaginationQueryDto } from 'src/pagination/PaginationQuery.dto';
import { AccountRequest } from 'src/account/decorators/AccountRequest.decorator';
import { SessionAccount } from 'src/account/dto/SessionAccount.dto';
import { Roles } from 'src/account/decorators/roles.decorator';
import { AccountRole } from '@prisma/client';

@Controller('film')
export class FilmController {
  constructor(public service: FilmService) {}

  @Roles([AccountRole.BUSINESS, AccountRole.USER])
  @Get()
  async getItems(@Query() pagination: PaginationQueryDto) {
    return this.service.getItems(pagination);
  }

  @Roles([AccountRole.BUSINESS, AccountRole.USER])
  @Get(':id')
  async getItem(@Param() params: IdDto) {
    return this.service.getItem(params.id);
  }

  @Roles([AccountRole.BUSINESS])
  @Post()
  async createItem(
    @Body() createFilmDto: CreateFilmDto,
    @AccountRequest() account: SessionAccount,
  ) {
    return this.service.createItem(account, createFilmDto);
  }

  @Roles([AccountRole.BUSINESS])
  @Patch(':id')
  async updateItem(
    @Param() params: IdDto,
    @Body() updateFilmDto: UpdateFilmDto,
    @AccountRequest() account: SessionAccount,
  ) {
    return this.service.updateItem(account, params.id, updateFilmDto);
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
