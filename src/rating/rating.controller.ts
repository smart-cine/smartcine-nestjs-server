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
import { RatingService } from './rating.service';
import { QueryRatingDto } from './dto/QueryRating.dto';
import { IdDto } from 'src/shared/id.dto';
import { CreateRatingDto } from './dto/CreateRating.dto';
import { SessionAccount } from 'src/account/dto/SessionAccount.dto';
import { AccountRequest } from 'src/account/decorators/AccountRequest.decorator';
import { UpdateRating } from './dto/UpdateRating.dto';
import { Roles } from 'src/account/decorators/roles.decorator';
import { AccountRole } from '@prisma/client';

@Controller('rating')
@Roles([AccountRole.USER, AccountRole.BUSINESS])
export class RatingController {
  constructor(private service: RatingService) {}

  @Get()
  async getItems(@Query() query: QueryRatingDto) {
    return this.service.getItems(query);
  }

  // @Get(':id')
  // async getItem(@Param() params: IdDto) {
  //   return this.service.getItem(params.id);
  // }

  @Post()
  async createItem(
    @Body() body: CreateRatingDto,
    @AccountRequest() account: SessionAccount,
  ) {
    return this.service.createItem(account, body);
  }

  @Patch(':id')
  async updateItem(
    @Param() params: IdDto,
    @Body() body: UpdateRating,
    @AccountRequest() account: SessionAccount,
  ) {
    return this.service.updateItem(account, params.id, body);
  }

  @Delete(':id')
  async deleteItem(
    @Param() params: IdDto,
    @AccountRequest() account: SessionAccount,
  ) {
    return this.service.deleteItem(account, params.id);
  }
}
