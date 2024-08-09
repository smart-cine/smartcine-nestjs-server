import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { TagService } from './tag.service';
import { QueryTagDto } from './dto/QueryTag.dto';
import { CreateTagDto } from './dto/CreateTag.dto';
import { DeleteTagDto } from './dto/DeleteTag.dto';

@Controller('tag')
export class TagController {
  constructor(private service: TagService) {}

  @Get()
  async getItems(@Query() query: QueryTagDto) {
    return this.service.getItems(query);
  }

  @Post()
  async createItem(@Body() body: CreateTagDto) {
    return this.service.createItem(body);
  }

  @Delete()
  async deleteItem(@Body() body: DeleteTagDto) {
    return this.service.deleteItem(body);
  }
}
