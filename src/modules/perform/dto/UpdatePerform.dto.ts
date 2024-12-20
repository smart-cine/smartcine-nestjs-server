import { PerformTranslateType, PerformViewType } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsDate,
  IsDateString,
  IsDecimal,
  IsEnum,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { StringToBuffer } from '@/utils/StringToBuffer';

export class UpdatePerformDto {
  @Transform(({ value }) => new Date(value))
  @IsDateString()
  @IsOptional()
  start_time?: Date;

  @Transform(({ value }) => new Date(value))
  @IsDate()
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
