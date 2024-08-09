import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateCinemaRoomDto } from './CreateCinemaRoom.dto';

export class UpdateCinemaRoomDto extends PartialType(
  PickType(CreateCinemaRoomDto, ['name']),
) {}
