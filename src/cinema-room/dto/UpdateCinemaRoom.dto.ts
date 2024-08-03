import { IsNotEmpty } from 'class-validator';
import { StringToBuffer } from 'src/utils/StringToBuffer';

export class UpdateCinemaRoomDto {
  @StringToBuffer()
  @IsNotEmpty()
  cinema_layout_id?: Buffer;

  @IsNotEmpty()
  name?: string;
}
