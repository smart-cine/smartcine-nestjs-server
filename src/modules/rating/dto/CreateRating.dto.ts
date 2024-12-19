import { RatingType } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, Max, Min } from 'class-validator';
import { StringToBuffer } from 'src/utils/StringToBuffer';

export class CreateRatingDto {
  @StringToBuffer()
  @IsNotEmpty()
  dest_id: Buffer;

  @IsEnum(RatingType)
  type: RatingType;

  @Min(0)
  @Max(1)
  @Transform(({ value }) => parseFloat(value))
  score: number;
}
