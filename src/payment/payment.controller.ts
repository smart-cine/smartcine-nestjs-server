import { Body, Controller, Get, Ip, Post, Query } from '@nestjs/common';
import { AccountRole } from '@prisma/client';
import { Roles } from 'src/account/decorators/roles.decorator';
import { PaymentService } from './payment.service';
import {
  AccountRequest,
  TAccountRequest,
} from 'src/account/decorators/AccountRequest.decorator';
import { CreatePaymentDto } from './dto/CreatePayment.dto';
import { RealIP } from 'nestjs-real-ip';
import { VNPAYWalletService } from './wallet/vnpay-wallet.service';
import { VNPAYIPNDto } from './dto/VNPAY-IPN.dto';

@Controller('payment')
export class PaymentController {
  constructor(
    private service: PaymentService,
    private vnpayWalletService: VNPAYWalletService,
  ) {}

  @Get('/ipn')
  async VNPayIPN(@Query() query: VNPAYIPNDto) {
    return this.vnpayWalletService.handleIPN(query);
  }

  @Post()
  @Roles([AccountRole.USER, AccountRole.BUSINESS])
  async create(
    @Body() body: CreatePaymentDto,
    @AccountRequest() account: TAccountRequest,
    @RealIP() ip: string,
  ) {
    console.log('ip', ip);
    return this.service.createItem(body, account, ip);
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
