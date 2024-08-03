import { Module } from '@nestjs/common';
import { CinemaProviderService } from './cinema-provider.service';
import { CinemaProviderController } from './cinema-provider.controller';

@Module({
  providers: [CinemaProviderService],
  controllers: [CinemaProviderController]
})
export class CinemaProviderModule {}
