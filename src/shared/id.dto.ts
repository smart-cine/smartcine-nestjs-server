import { IsNotEmpty, IsString } from 'class-validator';
import { StringToBuffer } from 'src/utils/StringToBuffer';

export class IdDto {
  @IsString()
  @IsNotEmpty()
  @StringToBuffer()
  id: Buffer;
}
