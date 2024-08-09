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
import { CommentService } from './comment.service';
import { QueryCommentDto } from './dto/QueryComment.dto';
import { IdDto } from 'src/shared/id.dto';
import { CreateCommentDto } from './dto/CreateComment.dto';
import { AccountRequest } from 'src/account/decorators/AccountRequest.decorator';
import { SessionAccount } from 'src/account/dto/SessionAccount.dto';
import { UpdateCommentDto } from './dto/UpdateComment.dto';

@Controller('comment')
export class CommentController {
  constructor(private service: CommentService) {}

  @Get()
  async getItems(@Query() query: QueryCommentDto) {
    return this.service.getItems(query);
  }

  @Get(':id')
  async getItem(@Param() params: IdDto) {
    return this.service.getItem(params.id);
  }

  @Post()
  async createItem(
    @Body() body: CreateCommentDto,
    @AccountRequest() account: SessionAccount,
  ) {
    return this.service.createItem(account, body);
  }

  @Patch(':id')
  async updateItem(@Param() params: IdDto, @Body() body: UpdateCommentDto) {
    return this.service.updateItem(params.id, body);
  }

  @Delete(':id')
  async deleteItem(@Param() params: IdDto) {
    return this.service.deleteItem(params.id);
  }
}
