import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { VNPAYWalletService } from './wallet/vnpay-wallet.service';

@Module({
  providers: [PaymentService, VNPAYWalletService],
  controllers: [PaymentController],
})
export class PaymentModule {}
