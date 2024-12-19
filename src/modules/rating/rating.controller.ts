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
import { IdDto } from '@/shared/id.dto';
import { CreateRatingDto } from './dto/CreateRating.dto';
import {
  AccountRequest,
  TAccountRequest,
} from '@/modules/account/decorators/AccountRequest.decorator';
import { UpdateRating } from './dto/UpdateRating.dto';
import { Roles } from '@/modules/account/decorators/roles.decorator';
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
    @AccountRequest() account: TAccountRequest,
  ) {
    return this.service.createItem(body, account);
  }

  @Patch(':id')
  async updateItem(
    @Param() params: IdDto,
    @Body() body: UpdateRating,
    @AccountRequest() account: TAccountRequest,
  ) {
    return this.service.updateItem(params.id, body, account);
  }

  @Delete(':id')
  async deleteItem(
    @Param() params: IdDto,
    @AccountRequest() account: TAccountRequest,
  ) {
    return this.service.deleteItem(params.id, account);
  }
}
