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
import { IdDto } from '@/shared/id.dto';
import { CreateCommentDto } from './dto/CreateComment.dto';
import {
  AccountRequest,
  TAccountRequest,
} from '@/modules/account/decorators/AccountRequest.decorator';
import { UpdateCommentDto } from './dto/UpdateComment.dto';
import { Roles } from '@/modules/account/decorators/roles.decorator';
import { AccountRole } from '@prisma/client';

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

  @Roles([AccountRole.USER, AccountRole.BUSINESS])
  @Post()
  async createItem(
    @Body() body: CreateCommentDto,
    @AccountRequest() account: TAccountRequest,
  ) {
    return this.service.createItem(account.id, body);
  }

  @Roles([AccountRole.USER, AccountRole.BUSINESS])
  @Patch(':id')
  async updateItem(@Param() params: IdDto, @Body() body: UpdateCommentDto) {
    return this.service.updateItem(params.id, body);
  }

  @Roles([AccountRole.USER, AccountRole.BUSINESS])
  @Delete(':id')
  async deleteItem(@Param() params: IdDto) {
    return this.service.deleteItem(params.id);
  }
}
