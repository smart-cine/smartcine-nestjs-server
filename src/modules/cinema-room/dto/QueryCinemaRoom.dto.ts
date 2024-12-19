import { IsOptional } from 'class-validator';
import { PaginationQueryDto } from '@/common/pagination/PaginationQuery.dto';
import { StringToBuffer } from '@/utils/StringToBuffer';

export class QueryCinemaRoomDto extends PaginationQueryDto {
  @StringToBuffer()
  @IsOptional()
  cinema_id?: Uint8Array;
}
