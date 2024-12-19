import { StringToBuffer } from 'src/utils/StringToBuffer';
import { IsNotEmpty, IsString } from 'class-validator';

export class QueryPickseatDto {
  @StringToBuffer()
  @IsNotEmpty()
  perform_id: Uint8Array;
}
