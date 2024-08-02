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
import { IdDto } from 'src/shared/id.dto';
import { PaginationQueryDto } from 'src/pagination/PaginationQuery.dto';
import { CreatePerformDto } from './dto/CreatePerform.dto';
import { UpdatePerformDto } from './dto/UpdatePerform.dto';
import { QueryPerformDto } from './dto/QueryPerform.dto';

@Controller('perform')
export class PerformController {
  constructor(private service: PerformService) {}

  @Post()
  create(@Body() createFilmDto: CreatePerformDto) {
    return this.service.createItem(createFilmDto);
  }

  @Get(':id')
  // @Roles([AccountRole.USER])
  get(@Param() params: IdDto) {
    return this.service.getItem(params.id);
  }

  @Get()
  getAll(@Query() query: QueryPerformDto) {
    return this.service.getItems(query);
  }

  @Patch(':id')
  delete(@Param() params: IdDto) {
    return this.service.deleteItem(params.id);
  }

  @Patch(':id')
  update(@Param() params: IdDto, @Body() updateFilmDto: UpdatePerformDto) {
    return this.service.updateItem(params.id, updateFilmDto);
  }
}
