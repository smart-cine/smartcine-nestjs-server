import { IsOptional } from 'class-validator';
import { PaginationQueryDto } from '@/common/pagination/PaginationQuery.dto';
import { StringToBuffer } from '@/utils/StringToBuffer';

export class QueryCinemaDto extends PaginationQueryDto {
  @StringToBuffer()
  @IsOptional()
  provider_id?: Uint8Array;
}
