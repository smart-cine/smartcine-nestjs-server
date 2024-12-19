import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateCinemaLayoutSeatDto } from './CreateCinemaLayoutSeat.dto';

export class UpdateCinemaLayoutSeat extends PartialType(
  PickType(CreateCinemaLayoutSeatDto, ['code']),
) {}
