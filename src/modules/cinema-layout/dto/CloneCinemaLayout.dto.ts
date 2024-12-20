import { IsNotEmpty } from 'class-validator';
import { StringToBuffer } from '@/utils/StringToBuffer';

export class CloneCinemaLayoutDto {
  @StringToBuffer()
  @IsNotEmpty()
  layout_id: Uint8Array;
}
