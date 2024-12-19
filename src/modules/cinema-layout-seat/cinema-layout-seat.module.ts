import { Module } from '@nestjs/common';
import { CinemaLayoutSeatService } from './cinema-layout-seat.service';
import { CinemaLayoutSeatController } from './cinema-layout-seat.controller';

@Module({
  providers: [CinemaLayoutSeatService],
  controllers: [CinemaLayoutSeatController]
})
export class CinemaLayoutSeatModule {}
