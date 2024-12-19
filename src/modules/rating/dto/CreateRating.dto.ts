import { RatingType } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, Max, Min } from 'class-validator';
import { StringToBuffer } from '@/utils/StringToBuffer';

export class CreateRatingDto {
  @StringToBuffer()
  @IsNotEmpty()
  dest_id: Uint8Array;

  @IsEnum(RatingType)
  type: RatingType;

  @Min(0)
  @Max(1)
  @Transform(({ value }) => parseFloat(value))
  score: number;
}
