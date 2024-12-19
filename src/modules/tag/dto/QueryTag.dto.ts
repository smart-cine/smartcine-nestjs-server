import { IsNotEmpty, IsOptional } from 'class-validator';
import { StringToBuffer } from '@/utils/StringToBuffer';

export class QueryTagDto {
  @StringToBuffer()
  @IsOptional()
  film_id?: Uint8Array;
}
