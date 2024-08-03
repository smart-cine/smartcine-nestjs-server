import { IsNotEmpty } from 'class-validator';
import { StringToBuffer } from 'src/utils/StringToBuffer';

export class CreateCinemaLayoutSeatDto {
  @StringToBuffer()
  @IsNotEmpty()
  layout_id: Buffer;

  @StringToBuffer()
  @IsNotEmpty()
  group_id: Buffer;
}
