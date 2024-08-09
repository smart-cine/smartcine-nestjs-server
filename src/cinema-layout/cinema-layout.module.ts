import { Module } from '@nestjs/common';
import { CinemaLayoutService } from './cinema-layout.service';
import { CinemaLayoutController } from './cinema-layout.controller';

@Module({
  providers: [CinemaLayoutService],
  controllers: [CinemaLayoutController]
})
export class CinemaLayoutModule {}
