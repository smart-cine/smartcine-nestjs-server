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
import { CinemaRoomService } from './cinema-room.service';
import { CreateCinemaRoomDto } from './dto/CreateCinemaRoom.dto';
import { IdDto } from 'src/shared/id.dto';
import { UpdateCinemaRoomDto } from './dto/UpdateCinemaRoom.dto';
import { Roles } from 'src/account/decorators/roles.decorator';
import { AccountRole } from '@prisma/client';
import { QueryCinemaRoomDto } from './dto/QueryCinemaRoom.dto';

@Controller('cinema-room')
// @Roles([AccountRole.USER])
export class CinemaRoomController {
  constructor(private service: CinemaRoomService) {}

  @Get()
  async getItems(@Query() query: QueryCinemaRoomDto) {
    return this.service.getItems(query);
  }

  @Get(':id')
  async getItem(@Param() params: IdDto) {
    return this.service.getItem(params.id);
  }

  @Post()
  @Roles([AccountRole.MANAGER])
  async create(@Body() body: CreateCinemaRoomDto) {
    return this.service.createItem(body);
  }

  @Patch(':id')
  @Roles([AccountRole.MANAGER])
  async update(@Param() params: IdDto, @Body() body: UpdateCinemaRoomDto) {
    return this.service.updateItem(params.id, body);
  }

  @Delete(':id')
  @Roles([AccountRole.MANAGER])
  async delete(@Param() params: IdDto) {
    return this.service.deleteItem(params.id);
  }
}
