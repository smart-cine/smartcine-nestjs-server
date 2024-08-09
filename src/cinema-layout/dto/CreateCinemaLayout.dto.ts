import { PickType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, Max, Min, ValidateNested } from 'class-validator';
import { CreateCinemaLayoutGroupDto } from 'src/cinema-layout-group/dto/CreateCinemaLayoutGroup.dto';
import { CreateCinemaLayoutSeatDto } from 'src/cinema-layout-seat/dto/CreateCinemaLayoutSeat.dto';
import { StringToBuffer } from 'src/utils/StringToBuffer';

// class SeatDto extends PickType(CreateCinemaLayoutSeatDto, [
//   'group_id',
//   'x',
//   'y',
//   'code',
// ]) {}
// class GroupDto extends PickType(CreateCinemaLayoutGroupDto, [
//   'name',
//   'color',
//   'price',
// ]) {}

export class CreateCinemaLayoutDto {
  @StringToBuffer()
  @IsNotEmpty()
  provider_id: Buffer;

  @Min(1)
  @Max(20)
  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  rows: number;

  @Min(1)
  @Max(20)
  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  columns: number;
}
