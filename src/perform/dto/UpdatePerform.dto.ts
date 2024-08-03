import { PerformTranslateType, PerformViewType } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsDecimal,
  IsEnum,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { StringToBuffer } from 'src/utils/StringToBuffer';

export class UpdatePerformDto {
  @StringToBuffer()
  @IsNotEmpty()
  @IsOptional()
  film_id?: Buffer;

  @StringToBuffer()
  @IsNotEmpty()
  @IsOptional()
  cinema_room_id?: Buffer;

  @Transform(({ value }) => new Date(value))
  @IsDateString()
  @IsOptional()
  start_time?: Date;

  @Transform(({ value }) => new Date(value))
  @IsDateString()
  @IsOptional()
  end_time?: Date;

  @IsEnum(PerformTranslateType)
  @IsOptional()
  translate_type?: PerformTranslateType;

  @IsEnum(PerformViewType)
  @IsOptional()
  view_type?: PerformViewType;

  @IsDecimal()
  @Transform(({ value }) => parseFloat(value))
  @IsOptional()
  price?: number;
}
