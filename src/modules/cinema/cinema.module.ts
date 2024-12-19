import { Module } from '@nestjs/common';
import { CinemaController } from './cinema.controller';
import { CinemaService } from './cinema.service';
import { CinemaProviderService } from '@/modules/cinema-provider/cinema-provider.service';

@Module({
  controllers: [CinemaController],
  providers: [CinemaService, CinemaProviderService],
})
export class CinemaModule {}
