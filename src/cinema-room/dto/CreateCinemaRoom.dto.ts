import { PickType, PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { CreateCinemaLayoutDto } from 'src/cinema-layout/dto/CreateCinemaLayout.dto';
import { StringToBuffer } from 'src/utils/StringToBuffer';

export class CreateCinemaRoomDto extends PartialType(
  PickType(CreateCinemaLayoutDto, ['rows', 'columns']),
) {
  @StringToBuffer()
  @IsNotEmpty()
  cinema_id: Buffer;

  @StringToBuffer()
  @IsOptional()
  cinema_layout_id?: Buffer;

  @IsNotEmpty()
  name: string;
}
