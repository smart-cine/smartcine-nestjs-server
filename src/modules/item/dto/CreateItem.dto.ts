import { Transform } from 'class-transformer';
import {
  IsDecimal,
  IsDefined,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';
import { IsBuffer } from '@/utils/IsBuffer';
import { StringToBuffer } from '@/utils/StringToBuffer';

export class CreateItemDto {
  @StringToBuffer()
  @IsOptional()
  parent_id?: Uint8Array;

  @StringToBuffer()
  @IsNotEmpty()
  cinema_id: Uint8Array;

  @IsNotEmpty()
  name: string;

  @IsDecimal()
  @Transform(({ value }) => parseFloat(value).toFixed(2), { toClassOnly: true })
  price: number;

  @Min(0)
  @Max(1)
  @Transform(({ value }) => parseFloat(value))
  discount: number;

  @IsUrl()
  image_url: string;
}
