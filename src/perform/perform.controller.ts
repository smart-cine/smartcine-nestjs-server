import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PerformService } from './perform.service';
import { IdDto } from 'src/shared/id.dto';
import { CreatePerformDto } from './dto/CreatePerform.dto';
import { UpdatePerformDto } from './dto/UpdatePerform.dto';
import { QueryPerformDto } from './dto/QueryPerform.dto';
import {
  AccountRequest,
  TAccountRequest,
} from 'src/account/decorators/AccountRequest.decorator';
import { Roles } from 'src/account/decorators/roles.decorator';
import { AccountRole, FeatureFlag } from '@prisma/client';
import { Feature } from 'src/account/decorators/feature.decorator';

@Controller('perform')
export class PerformController {
  constructor(private service: PerformService) {}

  @Get()
  getAll(@Query() query: QueryPerformDto) {
    return this.service.getItems(query);
  }

  @Get(':id')
  get(@Param() params: IdDto) {
    return this.service.getItem(params.id);
  }

  @Feature(FeatureFlag.CREATE_PERFORM)
  @Post()
  @Roles([AccountRole.BUSINESS])
  create(
    @Body() body: CreatePerformDto,
    @AccountRequest() account: TAccountRequest,
  ) {
    return this.service.createItem(body, account);
  }

  @Feature(FeatureFlag.UPDATE_PERFORM)
  @Patch(':id')
  @Roles([AccountRole.BUSINESS])
  update(
    @Param() params: IdDto,
    @Body() body: UpdatePerformDto,
    @AccountRequest() account: TAccountRequest,
  ) {
    return this.service.updateItem(params.id, body, account);
  }

  @Feature(FeatureFlag.DELETE_PERFORM)
  @Patch(':id')
  @Roles([AccountRole.BUSINESS])
  delete(@Param() params: IdDto, @AccountRequest() account: TAccountRequest) {
    return this.service.deleteItem(params.id, account);
  }
}
