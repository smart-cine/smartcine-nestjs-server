import { Transform } from 'class-transformer'
import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/pagination/PaginationQuery.dto';
import { StringToBuffer } from 'src/utils/StringToBuffer';

export class QueryPerformListCinemaDto extends PaginationQueryDto {
  @StringToBuffer()
  @IsNotEmpty()
  film_id: Buffer;

  @StringToBuffer()
  @IsOptional()
  cinema_provider_id?: Buffer;

  @IsString()
  @IsNotEmpty()
  area: string;

  @Transform(({ value }) => new Date(value))
  @IsDate()
  @IsNotEmpty()
  start_time: Date;
}
