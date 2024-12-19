import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateCinemaDto } from './CreateCinema.dto';

export class UpdateCinemaDto extends PartialType(
  PickType(CreateCinemaDto, ['name', 'address']),
) {}
