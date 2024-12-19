import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { StringToBuffer } from '@/utils/StringToBuffer';

export class CreateTagDto {
  @StringToBuffer()
  @IsNotEmpty()
  film_id: Uint8Array;

  @IsString({ each: true })
  @IsArray()
  tags: string[];
}
