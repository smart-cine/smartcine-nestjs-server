import { IsNotEmpty } from 'class-validator';
import { StringToBuffer } from 'src/utils/StringToBuffer';

export class CreateCinemaRoomDto {
  @StringToBuffer()
  @IsNotEmpty()
  cinema_id: Buffer;

  @StringToBuffer()
  @IsNotEmpty()
  cinema_layout_id: Buffer;

  @IsNotEmpty()
  name: string;
}
