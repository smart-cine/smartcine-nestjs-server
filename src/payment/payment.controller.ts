import { Body, Controller, Post } from '@nestjs/common';
import { AccountRole } from '@prisma/client';
import { Roles } from 'src/account/decorators/roles.decorator';
import { PaymentService } from './payment.service';
import {
  AccountRequest,
  TAccountRequest,
} from 'src/account/decorators/AccountRequest.decorator';
import { CreatePaymentDto } from './dto/CreatePayment.dto';

@Controller('controller')
@Roles([AccountRole.USER, AccountRole.BUSINESS])
export class PaymentController {
  constructor(private service: PaymentService) {}

  @Post()
  async create(
    @Body() body: CreatePaymentDto,
    @AccountRequest() account: TAccountRequest,
  ) {
    return this.service.createItem(body, account);
  }

  // @Feature(FeatureFlag.UPDATE_CINEMA_ROOM)
  // @Roles([AccountRole.BUSINESS])
  // @Patch(':id')
  // async update(
  //   @Param() params: IdDto,
  //   @Body() body: UpdateCinemaRoomDto,
  //   @AccountRequest() account: TAccountRequest,
  // ) {
  //   return this.service.updateItem(params.id, body, account);
  // }

  // @Feature(FeatureFlag.DELETE_CINEMA_ROOM)
  // @Roles([AccountRole.BUSINESS])
  // @Delete(':id')
  // async delete(
  //   @Param() params: IdDto,
  //   @AccountRequest() account: TAccountRequest,
  // ) {
  //   return this.service.deleteItem(params.id, account);
  // }
}
