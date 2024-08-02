import { Module } from '@nestjs/common';
import { PickseatService } from './pickseat.service';
import { PickseatController } from './pickseat.controller';

@Module({
  providers: [PickseatService],
  controllers: [PickseatController]
})
export class PickseatModule {}
