import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { StringToBuffer } from '@/utils/StringToBuffer';

export class CreateCinemaLayoutDto {
  @StringToBuffer()
  @IsOptional()
  room_id?: Uint8Array;

  @Min(1)
  @Max(20)
  @IsInt()
  @Type(() => Number)
  rows: number;

  @Min(1)
  @Max(20)
  @IsInt()
  @Type(() => Number)
  columns: number;
}
