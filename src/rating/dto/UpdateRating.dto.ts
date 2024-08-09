import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateRatingDto } from './CreateRating.dto';

export class UpdateRating extends PartialType(
  PickType(CreateRatingDto, ['score']),
) {}
