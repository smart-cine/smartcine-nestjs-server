import { IsOptional } from 'class-validator';
import { PaginationQueryDto } from 'src/pagination/PaginationQuery.dto';
import { StringToBuffer } from 'src/utils/StringToBuffer';

export class QueryCinemaLayoutDto extends PaginationQueryDto {
  @StringToBuffer()
  @IsOptional()
  provider_id?: Buffer;
}
