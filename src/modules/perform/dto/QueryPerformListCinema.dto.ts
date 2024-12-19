import { Transform } from 'class-transformer'
import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/common/pagination/PaginationQuery.dto';
import { StringToBuffer } from 'src/utils/StringToBuffer';

export class QueryPerformListCinemaDto extends PaginationQueryDto {
  @StringToBuffer()
  @IsNotEmpty()
  film_id: Uint8Array;

  @StringToBuffer()
  @IsOptional()
  cinema_provider_id?: Uint8Array;

  @IsString()
  @IsNotEmpty()
  area: string;

  @Transform(({ value }) => new Date(value))
  @IsDate()
  @IsNotEmpty()
  start_time: Date;
}
