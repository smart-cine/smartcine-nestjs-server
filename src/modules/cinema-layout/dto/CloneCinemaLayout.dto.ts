import { IsNotEmpty } from 'class-validator';
import { StringToBuffer } from 'src/utils/StringToBuffer';

export class CloneCinemaLayoutDto {
  @StringToBuffer()
  @IsNotEmpty()
  layout_id: Buffer;
}
