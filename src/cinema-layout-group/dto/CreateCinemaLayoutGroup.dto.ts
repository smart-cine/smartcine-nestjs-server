import { Transform, Type } from 'class-transformer';
import { IsDecimal, IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';
import { StringToBuffer } from 'src/utils/StringToBuffer';

export class CreateCinemaLayoutGroupDto {
  @StringToBuffer()
  @IsNotEmpty()
  layout_id: Buffer;

  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @Min(0)
  @Max(7)
  color_code: string;

  @IsDecimal()
  @Transform(({ value }) => parseFloat(value))
  @IsNotEmpty()
  price: number;
}
