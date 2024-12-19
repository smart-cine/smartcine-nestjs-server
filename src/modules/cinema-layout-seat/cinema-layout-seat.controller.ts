import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
import { CinemaLayoutSeatService } from './cinema-layout-seat.service';
import { CreateCinemaLayoutSeatDto } from './dto/CreateCinemaLayoutSeat.dto';
import { UpdateCinemaLayoutSeat } from './dto/UpdateCinemaLayoutSeat.dto';
import { IdDto } from '@/shared/id.dto';
import { Roles } from '@/modules/account/decorators/roles.decorator';
import { AccountRole, FeatureFlag } from '@prisma/client';
import {
  AccountRequest,
  TAccountRequest,
} from '@/modules/account/decorators/AccountRequest.decorator';
import { Feature } from '@/modules/account/decorators/feature.decorator';

@Roles([AccountRole.BUSINESS])
@Controller('cinema-layout-seat')
export class CinemaLayoutSeatController {
  constructor(private service: CinemaLayoutSeatService) {}

  @Feature(FeatureFlag.CREATE_CINEMA_LAYOUT_SEAT)
  @Post()
  async createItem(
    @Body() body: CreateCinemaLayoutSeatDto,
    @AccountRequest() account: TAccountRequest,
  ) {
    return this.service.createItem(body, account);
  }

  @Feature(FeatureFlag.UPDATE_CINEMA_LAYOUT_SEAT)
  @Patch(':id')
  async updateItem(
    @Param() params: IdDto,
    @Body() body: UpdateCinemaLayoutSeat,
    @AccountRequest() account: TAccountRequest,
  ) {
    return this.service.updateItem(params.id, body, account);
  }

  @Feature(FeatureFlag.DELETE_CINEMA_LAYOUT_SEAT)
  @Delete(':id')
  async deleteItem(
    @Param() params: IdDto,
    @AccountRequest() account: TAccountRequest,
  ) {
    return this.service.deleteItem(params.id, account);
  }
}
