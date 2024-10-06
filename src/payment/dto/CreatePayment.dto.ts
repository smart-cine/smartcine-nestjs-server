import { WalletType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { StringToBuffer } from 'src/utils/StringToBuffer';

export class CreatePaymentDto {
  @StringToBuffer()
  @IsNotEmpty()
  perform_id: Buffer;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemPayment)
  @IsNotEmpty()
  items: ItemPayment[];

  @IsEnum(WalletType)
  @IsNotEmpty()
  type: WalletType;
}

class ItemPayment {
  @StringToBuffer()
  @IsNotEmpty()
  id: Buffer;

  @IsInt()
  @IsNotEmpty()
  quantity: number;
}
