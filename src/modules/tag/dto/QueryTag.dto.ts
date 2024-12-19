import { IsNotEmpty, IsOptional } from 'class-validator';
import { StringToBuffer } from 'src/utils/StringToBuffer';

export class QueryTagDto {
  @StringToBuffer()
  @IsOptional()
  film_id?: Uint8Array;
}
