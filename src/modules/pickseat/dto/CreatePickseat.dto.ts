import { IsNotEmpty, IsString } from 'class-validator';
import { StringToBuffer } from 'src/utils/StringToBuffer';

export class CreatePickseatDto {
  @StringToBuffer()
  @IsNotEmpty()
  perform_id: Uint8Array;

  @StringToBuffer()
  @IsNotEmpty()
  layout_seat_id: Uint8Array;
}
