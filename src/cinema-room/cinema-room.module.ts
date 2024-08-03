import { Module } from '@nestjs/common';
import { CinemaRoomService } from './cinema-room.service';
import { CinemaRoomController } from './cinema-room.controller';

@Module({
  providers: [CinemaRoomService],
  controllers: [CinemaRoomController]
})
export class CinemaRoomModule {}
