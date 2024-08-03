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
import { Account } from 'src/account/decorators/Account.decorator';
import { SessionAccount } from 'src/account/dto/SessionAccount.dto';
import { Roles } from 'src/account/decorators/roles.decorator';
import { AccountRole } from '@prisma/client';

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

  @Post()
  @Roles([AccountRole.MANAGER])
  create(
    @Body() createFilmDto: CreatePerformDto,
    @Account() account: SessionAccount,
  ) {
    return this.service.createItem(account, createFilmDto);
  }

  @Patch(':id')
  @Roles([AccountRole.MANAGER])
  update(@Param() params: IdDto, @Body() body: UpdatePerformDto) {
    return this.service.updateItem(params.id, body);
  }

  @Patch(':id')
  @Roles([AccountRole.MANAGER])
  delete(@Param() params: IdDto) {
    return this.service.deleteItem(params.id);
  }
}
