import { IsNotEmpty, IsString } from 'class-validator';
import { StringToBuffer } from 'src/utils/StringToBuffer';

export class IdDto {
  @StringToBuffer()
  @IsNotEmpty()
  id: Uint8Array;
}
