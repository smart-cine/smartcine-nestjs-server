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
import { CinemaProviderService } from './cinema-provider.service';
import { IdDto } from 'src/shared/id.dto';
import { CreateCinemaProviderDto } from './dto/CreateCinemaProvider.dto';
import { UpdateCinemaProviderDto } from './dto/UpdateCinemaProvider.dto';
import { QueryCinemaProviderDto } from './dto/QueryCinemaProvider.dto';
import { AccountRole, FeatureFlag } from '@prisma/client';
import { Roles } from 'src/modules/account/decorators/roles.decorator';
import {
  AccountRequest,
  TAccountRequest,
} from 'src/modules/account/decorators/AccountRequest.decorator';
import { Feature } from 'src/modules/account/decorators/feature.decorator';

@Controller('cinema-provider')
export class CinemaProviderController {
  constructor(private service: CinemaProviderService) {}

  @Get()
  getItems(@Query() query: QueryCinemaProviderDto) {
    return this.service.getItems(query);
  }

  @Get(':id')
  getItem(@Param() params: IdDto) {
    return this.service.getItem(params.id);
  }

  @Roles([AccountRole.BUSINESS])
  @Post()
  create(
    @Body() body: CreateCinemaProviderDto,
    @AccountRequest() account: TAccountRequest,
  ) {
    return this.service.createItem(account, body);
  }

  @Feature(FeatureFlag.UPDATE_CINEMA_PROVIDER)
  @Roles([AccountRole.BUSINESS])
  @Patch()
  update(
    @Body() body: UpdateCinemaProviderDto,
    @AccountRequest() account: TAccountRequest,
  ) {
    return this.service.updateItem(body, account);
  }

  @Feature(FeatureFlag.DELETE_CINEMA_PROVIDER)
  @Roles([AccountRole.BUSINESS])
  @Delete()
  delete(@AccountRequest() account: TAccountRequest) {
    return this.service.deleteItem(account);
  }
}
