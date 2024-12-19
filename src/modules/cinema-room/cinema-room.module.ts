import { Module } from '@nestjs/common';
import { CinemaRoomService } from './cinema-room.service';
import { CinemaRoomController } from './cinema-room.controller';
import { CinemaLayoutService } from 'src/modules/cinema-layout/cinema-layout.service';

@Module({
  controllers: [CinemaRoomController],
  providers: [CinemaRoomService, CinemaLayoutService],
})
export class CinemaRoomModule {}
