import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
import { CinemaLayoutGroupService } from './cinema-layout-group.service';
import { CreateCinemaLayoutGroupDto } from './dto/CreateCinemaLayoutGroup.dto';
import { UpdateCinemaLayoutGroupDto } from './dto/UpdateCinemaLayoutGroup.dto';
import { IdDto } from '@/shared/id.dto';
import { Roles } from '@/modules/account/decorators/roles.decorator';
import { AccountRole, FeatureFlag } from '@prisma/client';
import {
  AccountRequest,
  TAccountRequest,
} from '@/modules/account/decorators/AccountRequest.decorator';
import { Feature } from '@/modules/account/decorators/feature.decorator';

@Roles([AccountRole.BUSINESS])
@Controller('cinema-layout-group')
export class CinemaLayoutGroupController {
  constructor(private service: CinemaLayoutGroupService) {}

  @Feature(FeatureFlag.CREATE_CINEMA_LAYOUT_GROUP)
  @Post()
  async createItem(
    @Body() body: CreateCinemaLayoutGroupDto,
    @AccountRequest() account: TAccountRequest,
  ) {
    return this.service.createItem(body, account);
  }

  @Feature(FeatureFlag.UPDATE_CINEMA_LAYOUT_GROUP)
  @Patch(':id')
  async updateItem(
    @Param() params: IdDto,
    @Body() body: UpdateCinemaLayoutGroupDto,
    @AccountRequest() account: TAccountRequest,
  ) {
    return this.service.updateItem(params.id, body, account);
  }

  @Feature(FeatureFlag.DELETE_CINEMA_LAYOUT_GROUP)
  @Delete(':id')
  async deleteItem(
    @Param() params: IdDto,
    @AccountRequest() account: TAccountRequest,
  ) {
    return this.service.deleteItem(params.id, account);
  }
}
