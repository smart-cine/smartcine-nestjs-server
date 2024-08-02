import { Module } from '@nestjs/common';
import { PerformService } from './perform.service';
import { PerformController } from './perform.controller';

@Module({
  providers: [PerformService],
  controllers: [PerformController]
})
export class PerformModule {}
