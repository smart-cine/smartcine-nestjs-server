import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
import { CinemaLayoutGroupService } from './cinema-layout-group.service';
import { CreateCinemaLayoutGroupDto } from './dto/CreateCinemaLayoutGroup.dto';
import { UpdateCinemaLayoutGroupDto } from './dto/UpdateCinemaLayoutGroup.dto';
import { IdDto } from 'src/shared/id.dto';

@Controller('cinema-layout-group')
export class CinemaLayoutGroupController {
  constructor(private service: CinemaLayoutGroupService) {}

  @Post()
  async createItem(@Body() body: CreateCinemaLayoutGroupDto) {
    return this.service.createItem(body);
  }

  @Patch(':id')
  async updateItem(
    @Param() params: IdDto,
    @Body() body: UpdateCinemaLayoutGroupDto,
  ) {
    return this.service.updateItem(params.id, body);
  }

  @Delete(':id')
  async deleteItem(@Param() params: IdDto) {
    return this.service.deleteItem(params.id);
  }
}
