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
import { CinemaService } from './cinema.service';
import { QueryCinemaDto } from './dto/QueryCinema.dto';
import { IdDto } from 'src/shared/id.dto';
import { CreateCinemaDto } from './dto/CreateCinema.dto';
import { UpdateCinemaDto } from './dto/UpdateCinema.dto';
import { Roles } from 'src/account/decorators/roles.decorator';
import { AccountRole } from '@prisma/client';

@Controller('cinema')
export class CinemaController {
  constructor(private service: CinemaService) {}
  @Get()
  async getItems(@Query() query: QueryCinemaDto) {
    return this.service.getItems(query);
  }

  @Get(':id')
  async getItem(@Param() params: IdDto) {
    return this.service.getItem(params.id);
  }

  @Post()
  @Roles([AccountRole.BUSINESS])
  async createItem(@Body() body: CreateCinemaDto) {
    return this.service.createItem(body);
  }

  @Patch(':id')
  @Roles([AccountRole.BUSINESS])
  async updateItem(@Param() params: IdDto, @Body() body: UpdateCinemaDto) {
    return this.service.updateItem(params.id, body);
  }

  @Delete(':id')
  @Roles([AccountRole.BUSINESS])
  async deleteItem(@Param() params: IdDto) {
    return this.service.deleteItem(params.id);
  }
}
