import { IsNotEmpty, IsString } from 'class-validator';
import { StringToBuffer } from '@/utils/StringToBuffer';

export class IdDto {
  @StringToBuffer()
  @IsNotEmpty()
  id: Uint8Array;
}
