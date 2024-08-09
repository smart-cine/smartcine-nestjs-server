import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateCinemaLayoutDto } from './CreateCinemaLayout.dto';

export class UpdateCinemaLayoutDto extends PartialType(
  PickType(CreateCinemaLayoutDto, ['rows', 'columns']),
) {}
