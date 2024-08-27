import { Module } from '@nestjs/common';
import { CinemaRoomService } from './cinema-room.service';
import { CinemaRoomController } from './cinema-room.controller';
import { CinemaLayoutService } from 'src/cinema-layout/cinema-layout.service';

@Module({
  providers: [CinemaRoomService, CinemaLayoutService],
  controllers: [CinemaRoomController],
})
export class CinemaRoomModule {}
