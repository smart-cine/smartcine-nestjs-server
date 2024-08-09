import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
import { CinemaLayoutSeatService } from './cinema-layout-seat.service';
import { CreateCinemaLayoutSeatDto } from './dto/CreateCinemaLayoutSeat.dto';
import { UpdateCinemaLayoutSeat } from './dto/UpdateCinemaLayoutSeat.dto';
import { IdDto } from 'src/shared/id.dto';

@Controller('cinema-layout-seat')
export class CinemaLayoutSeatController {
  constructor(private service: CinemaLayoutSeatService) {}

  @Post()
  async createItem(@Body() body: CreateCinemaLayoutSeatDto) {
    return this.service.createItem(body);
  }

  @Patch(':id')
  async updateItem(
    @Param() params: IdDto,
    @Body() body: UpdateCinemaLayoutSeat,
  ) {
    return this.service.updateItem(params.id, body);
  }

  @Delete(':id')
  async deleteItem(@Param() params: IdDto) {
    return this.service.deleteItem(params.id);
  }
}
