import { Module } from '@nestjs/common';
import { CinemaLayoutController } from './cinema-layout.controller';
import { CinemaLayoutService } from './cinema-layout.service';

@Module({
  controllers: [CinemaLayoutController],
  providers: [CinemaLayoutService]
})
export class CinemaLayoutModule {}
