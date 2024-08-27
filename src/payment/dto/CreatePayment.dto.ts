import { WalletType } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { StringToBuffer } from 'src/utils/StringToBuffer';

export class CreatePaymentDto {
  @StringToBuffer()
  @IsNotEmpty()
  perform_id: Buffer;

  @StringToBuffer()
  @IsNotEmpty()
  item_id: Buffer;

  @IsEnum(WalletType)
  @IsNotEmpty()
  type: WalletType;
}
