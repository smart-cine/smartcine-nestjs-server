import { IsOptional } from 'class-validator';
import { PaginationQueryDto } from 'src/common/pagination/PaginationQuery.dto';
import { StringToBuffer } from 'src/utils/StringToBuffer';

export class QueryCinemaLayoutDto extends PaginationQueryDto {
  @StringToBuffer()
  @IsOptional()
  provider_id?: Uint8Array;
}
