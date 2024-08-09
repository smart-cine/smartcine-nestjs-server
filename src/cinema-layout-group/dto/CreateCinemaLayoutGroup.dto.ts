import { Transform, Type } from 'class-transformer';
import { IsDecimal, IsInt, IsNotEmpty, Max, Min } from 'class-validator';
import { StringToBuffer } from 'src/utils/StringToBuffer';

export class CreateCinemaLayoutGroupDto {
  @StringToBuffer()
  @IsNotEmpty()
  layout_id: Buffer;

  @IsNotEmpty()
  name: string;

  @Min(0)
  @Max(255)
  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  color: number;

  @IsDecimal()
  @Transform(({ value }) => parseFloat(value))
  @IsNotEmpty()
  price: number;
}
