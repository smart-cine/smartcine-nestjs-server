import { Module } from '@nestjs/common';
import { CinemaLayoutGroupService } from './cinema-layout-group.service';
import { CinemaLayoutGroupController } from './cinema-layout-group.controller';

@Module({
  providers: [CinemaLayoutGroupService],
  controllers: [CinemaLayoutGroupController]
})
export class CinemaLayoutGroupModule {}
