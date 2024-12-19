import { Transform } from 'class-transformer'
import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/common/pagination/PaginationQuery.dto';
import { StringToBuffer } from 'src/utils/StringToBuffer';

export class QueryPerformListFilmDto extends PaginationQueryDto {
  @StringToBuffer()
  @IsNotEmpty()
  cinema_id: Uint8Array;

  @Transform(({ value }) => new Date(value))
  @IsDate()
  @IsNotEmpty()
  start_time: Date;
}
