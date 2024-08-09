import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateCinemaLayoutGroupDto } from './CreateCinemaLayoutGroup.dto';

export class UpdateCinemaLayoutGroupDto extends PartialType(
  PickType(CreateCinemaLayoutGroupDto, ['name', 'color', 'price']),
) {}
