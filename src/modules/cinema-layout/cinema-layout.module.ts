import { Module } from '@nestjs/common';
import { CinemaLayoutService } from './cinema-layout.service';
import { CinemaLayoutController } from './cinema-layout.controller';
import { CinemaProviderService } from '@/modules/cinema-provider/cinema-provider.service';

@Module({
  providers: [CinemaLayoutService, CinemaProviderService],
  controllers: [CinemaLayoutController],
})
export class CinemaLayoutModule {}
