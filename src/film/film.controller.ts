import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UsePipes,
} from '@nestjs/common';
import { FilmService } from './film.service';
import { CreateFilmDto } from './dto/CreateFilm.dto';
import { UpdateFilmDto } from './dto/UpdateFilm.dto';
import { IdDto } from 'src/shared/id.dto';

@Controller('film')
export class FilmController {
  constructor(private service: FilmService) {}

  @Post()
  create(@Body() createFilmDto: CreateFilmDto) {
    return this.service.createItem(createFilmDto);
  }

  @Get(':id')
  get(@Param() params: IdDto) {
    return this.service.getItem(params.id);
  }

  @Get()
  getAll() {
    return this.service.getItems();
  }

  @Patch(':id')
  delete(@Param() params: IdDto) {
    return this.service.deleteItem(params.id);
  }

  @Patch(':id')
  update(@Param() params: IdDto, @Body() updateFilmDto: UpdateFilmDto) {
    return this.service.updateItem(params.id, updateFilmDto);
  }
}
