import { Transform } from 'class-transformer';
import {
  IsDecimal,
  IsDefined,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { IsBuffer } from 'src/utils/IsBuffer';
import { StringToBuffer } from 'src/utils/StringToBuffer';

export class CreateItemDto {
  @StringToBuffer()
  @IsOptional()
  parent_id?: Buffer;

  @StringToBuffer()
  @IsNotEmpty()
  cinema_id: Buffer;

  @IsNotEmpty()
  name: string;

  @IsDecimal()
  @Transform(({ value }) => parseFloat(value).toFixed(2), { toClassOnly: true })
  price: number;

  @Min(0)
  @Max(1)
  @Transform(({ value }) => parseFloat(value))
  discount: number;
}
