import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, Max, Min } from 'class-validator';
import { StringToBuffer } from 'src/utils/StringToBuffer';

export class CreateCinemaLayoutSeatDto {
  @StringToBuffer()
  @IsNotEmpty()
  layout_id: Buffer;

  @StringToBuffer()
  @IsNotEmpty()
  group_id: Buffer;

  @Min(0)
  @Max(19)
  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  x: number;

  @Min(0)
  @Max(19)
  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  y: number;

  @IsNotEmpty()
  code: string;
}
