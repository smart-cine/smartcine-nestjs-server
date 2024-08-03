import { IsNotEmpty } from 'class-validator';
import { StringToBuffer } from 'src/utils/StringToBuffer';

export class CreateCinemaDto {
  @StringToBuffer()
  @IsNotEmpty()
  provider_id: Buffer;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  address: string;
}
