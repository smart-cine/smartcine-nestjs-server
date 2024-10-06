import { PerformTranslateType, PerformViewType } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsDate, IsDateString, IsDecimal, IsEnum, IsNotEmpty } from 'class-validator';
import { StringToBuffer } from 'src/utils/StringToBuffer';

export class CreatePerformDto {
  @StringToBuffer()
  @IsNotEmpty()
  film_id: Buffer;

  @StringToBuffer()
  @IsNotEmpty()
  cinema_room_id: Buffer;

  @Transform(({ value }) => new Date(value))
  @IsDate()
  start_time: Date;

  @Transform(({ value }) => new Date(value))
  @IsDate()
  end_time: Date;

  @IsEnum(PerformTranslateType)
  translate_type: PerformTranslateType;

  @IsEnum(PerformViewType)
  view_type: PerformViewType;

  @IsDecimal()
  @Transform(({ value }) => parseFloat(value))
  price: number;
}
