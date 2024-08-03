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
import { CinemaProviderService } from './cinema-provider.service';
import { IdDto } from 'src/shared/id.dto';
import { CreateCinemaProviderDto } from './dto/CreateCinemaProvider.dto';
import { UpdateCinemaProviderDto } from './dto/UpdateCinemaProvider.dto';
import { QueryCinemaProviderDto } from './dto/QueryCinemaProvider.dto';

@Controller('cinema-provider')
export class CinemaProviderController {
  constructor(private service: CinemaProviderService) {}

  @Get()
  getItems(@Query() query: QueryCinemaProviderDto) {
    return this.service.getItems(query);
  }

  @Get(':id')
  getItem(@Param() params: IdDto) {
    return this.service.getItem(params.id);
  }

  @Post()
  create(@Body() body: CreateCinemaProviderDto) {
    return this.service.createItem(body);
  }

  @Patch(':id')
  update(@Param() params: IdDto, @Body() body: UpdateCinemaProviderDto) {
    return this.service.updateItem(params.id, body);
  }

  @Delete(':id')
  delete(@Param() params: IdDto) {
    return this.service.deleteItem(params.id);
  }
}
