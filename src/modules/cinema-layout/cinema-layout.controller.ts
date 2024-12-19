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
import { CinemaLayoutService } from './cinema-layout.service';
import { QueryCinemaLayoutDto } from './dto/QueryCinemaLayout.dto';
import { IdDto } from 'src/shared/id.dto';
import { CreateCinemaLayoutDto } from './dto/CreateCinemaLayout.dto';
import { UpdateCinemaLayoutDto } from './dto/UpdateCinemaLayout.dto';
import { Roles } from 'src/modules/account/decorators/roles.decorator';
import { AccountRole, FeatureFlag } from '@prisma/client';
import { CloneCinemaLayoutDto } from './dto/CloneCinemaLayout.dto';
import {
  AccountRequest,
  TAccountRequest,
} from 'src/modules/account/decorators/AccountRequest.decorator';
import { Feature } from 'src/modules/account/decorators/feature.decorator';

@Controller('cinema-layout')
@Roles([AccountRole.BUSINESS])
export class CinemaLayoutController {
  constructor(private service: CinemaLayoutService) {}

  @Get()
  async getItems(
    @Query() query: QueryCinemaLayoutDto,
    @AccountRequest() account: TAccountRequest,
  ) {
    return this.service.getItems(query, account);
  }

  @Get(':id')
  async getItem(
    @Param() params: IdDto,
    @AccountRequest() account: TAccountRequest,
  ) {
    return this.service.getItem(params.id, account);
  }

  @Feature(FeatureFlag.CREATE_CINEMA_LAYOUT)
  @Post()
  async createItem(
    @Body() body: CreateCinemaLayoutDto,
    @AccountRequest() account: TAccountRequest,
  ) {
    return this.service.createItem(body, account);
  }

  @Feature(FeatureFlag.CLONE_CINEMA_LAYOUT)
  @Post('/clone')
  async cloneItem(
    @Body() body: CloneCinemaLayoutDto,
    @AccountRequest() account: TAccountRequest,
  ) {
    return this.service.cloneItem(body, account);
  }

  @Feature(FeatureFlag.UPDATE_CINEMA_LAYOUT)
  @Patch(':id')
  async updateItem(
    @Param() params: IdDto,
    @Body() body: UpdateCinemaLayoutDto,
    @AccountRequest() account: TAccountRequest,
  ) {
    return this.service.updateItem(params.id, body, account);
  }

  @Feature(FeatureFlag.DELETE_CINEMA_LAYOUT)
  @Delete(':id')
  async deleteItem(
    @Param() params: IdDto,
    @AccountRequest() account: TAccountRequest,
  ) {
    return this.service.deleteItem(params.id, account);
  }
}
