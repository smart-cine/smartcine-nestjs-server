import { Transform } from 'class-transformer'
import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/pagination/PaginationQuery.dto';
import { StringToBuffer } from 'src/utils/StringToBuffer';

export class QueryPerformListFilmDto extends PaginationQueryDto {
  @StringToBuffer()
  @IsNotEmpty()
  cinema_id: Buffer;

  @Transform(({ value }) => new Date(value))
  @IsDate()
  @IsNotEmpty()
  start_time: Date;
}
