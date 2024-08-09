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
import { Permissions } from 'src/account/decorators/permissions.decorator';
import { AccountRole, CinemaProviderPermission } from '@prisma/client';
import { Roles } from 'src/account/decorators/roles.decorator';
import {
  CinemaProviderRequest,
  TCinemaProviderRequest,
} from 'src/account/decorators/CinemaProviderRequest.decorator';
import {
  AccountRequest,
  TAccountRequest,
} from 'src/account/decorators/AccountRequest.decorator';

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
  @Permissions()
  @Post()
  create(
    @Body() body: CreateCinemaProviderDto,
    @AccountRequest() account: TAccountRequest,
    @CinemaProviderRequest()
    cinemaProvider: TCinemaProviderRequest,
  ) {
    if (cinemaProvider.cinema_provider_id) {
      throw new Error('You already manage a cinema provider');
    }
    return this.service.createItem(account, body);
  }

  @Permissions(CinemaProviderPermission.ADMIN)
  @Patch()
  update(
    @Body() body: UpdateCinemaProviderDto,
    @CinemaProviderRequest() cinemaProvider: TCinemaProviderRequest,
  ) {
    if (!cinemaProvider.cinema_provider_id) {
      throw new Error('You do not manage any cinema provider');
    }
    return this.service.updateItem(cinemaProvider.cinema_provider_id, body);
  }

  @Permissions(CinemaProviderPermission.ADMIN)
  @Delete()
  delete(@CinemaProviderRequest() cinemaProvider: TCinemaProviderRequest) {
    if (!cinemaProvider.cinema_provider_id) {
      throw new Error('You do not manage any cinema provider');
    }
    return this.service.deleteItem(cinemaProvider.cinema_provider_id);
  }
}
