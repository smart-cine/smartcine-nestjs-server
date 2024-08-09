import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { StringToBuffer } from 'src/utils/StringToBuffer';

export class CreateTagDto {
  @StringToBuffer()
  @IsNotEmpty()
  film_id: Buffer;

  @IsString({ each: true })
  @IsArray()
  tags: string[];
}
