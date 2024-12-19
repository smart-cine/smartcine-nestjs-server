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
import { CinemaService } from './cinema.service';
import { QueryCinemaDto } from './dto/QueryCinema.dto';
import { IdDto } from 'src/shared/id.dto';
import { CreateCinemaDto } from './dto/CreateCinema.dto';
import { UpdateCinemaDto } from './dto/UpdateCinema.dto';
import { Roles } from 'src/modules/account/decorators/roles.decorator';
import { AccountRole, FeatureFlag } from '@prisma/client';
import {
  AccountRequest,
  TAccountRequest,
} from 'src/modules/account/decorators/AccountRequest.decorator';
import { Feature } from 'src/modules/account/decorators/feature.decorator';

@Controller('cinema')
@Roles([AccountRole.USER, AccountRole.BUSINESS])
export class CinemaController {
  constructor(private service: CinemaService) {}

  @Get()
  async getItems(@Query() query: QueryCinemaDto) {
    return this.service.getItems(query);
  }

  @Get(':id')
  async getItem(@Param() params: IdDto) {
    return this.service.getItem(params.id);
  }

  @Feature(FeatureFlag.CREATE_CINEMA)
  @Roles([AccountRole.BUSINESS])
  @Post()
  async createItem(
    @Body() body: CreateCinemaDto,
    @AccountRequest() account: TAccountRequest,
  ) {
    return this.service.createItem(body, account);
  }

  @Feature(FeatureFlag.UPDATE_CINEMA)
  @Roles([AccountRole.BUSINESS])
  @Patch(':id')
  async updateItem(
    @Param() params: IdDto,
    @Body() body: UpdateCinemaDto,
    @AccountRequest() account: TAccountRequest,
  ) {
    return this.service.updateItem(params.id, body, account);
  }

  @Feature(FeatureFlag.DELETE_CINEMA)
  @Roles([AccountRole.BUSINESS])
  @Delete(':id')
  async deleteItem(
    @Param() params: IdDto,
    @AccountRequest() account: TAccountRequest,
  ) {
    return this.service.deleteItem(params.id, account);
  }
}
