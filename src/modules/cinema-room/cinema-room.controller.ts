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
import { CinemaRoomService } from './cinema-room.service';
import { CreateCinemaRoomDto } from './dto/CreateCinemaRoom.dto';
import { IdDto } from '@/shared/id.dto';
import { UpdateCinemaRoomDto } from './dto/UpdateCinemaRoom.dto';
import { Roles } from '@/modules/account/decorators/roles.decorator';
import { AccountRole, FeatureFlag } from '@prisma/client';
import { QueryCinemaRoomDto } from './dto/QueryCinemaRoom.dto';
import { Feature } from '@/modules/account/decorators/feature.decorator';
import {
  AccountRequest,
  TAccountRequest,
} from '@/modules/account/decorators/AccountRequest.decorator';

@Controller('cinema-room')
@Roles([AccountRole.USER, AccountRole.BUSINESS])
export class CinemaRoomController {
  constructor(private service: CinemaRoomService) {}

  @Get()
  async getItems(@Query() query: QueryCinemaRoomDto) {
    return this.service.getItems(query);
  }

  @Get(':id')
  async getItem(@Param() params: IdDto) {
    return this.service.getItem(params.id);
  }

  @Feature(FeatureFlag.CREATE_CINEMA_ROOM)
  @Roles([AccountRole.BUSINESS])
  @Post()
  async create(
    @Body() body: CreateCinemaRoomDto,
    @AccountRequest() account: TAccountRequest,
  ) {
    return this.service.createItem(body, account);
  }

  @Feature(FeatureFlag.UPDATE_CINEMA_ROOM)
  @Roles([AccountRole.BUSINESS])
  @Patch(':id')
  async update(
    @Param() params: IdDto,
    @Body() body: UpdateCinemaRoomDto,
    @AccountRequest() account: TAccountRequest,
  ) {
    return this.service.updateItem(params.id, body, account);
  }

  @Feature(FeatureFlag.DELETE_CINEMA_ROOM)
  @Roles([AccountRole.BUSINESS])
  @Delete(':id')
  async delete(
    @Param() params: IdDto,
    @AccountRequest() account: TAccountRequest,
  ) {
    return this.service.deleteItem(params.id, account);
  }
}
