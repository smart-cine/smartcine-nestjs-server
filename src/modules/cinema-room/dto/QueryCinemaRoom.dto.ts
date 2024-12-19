import { IsOptional } from 'class-validator';
import { PaginationQueryDto } from 'src/common/pagination/PaginationQuery.dto';
import { StringToBuffer } from 'src/utils/StringToBuffer';

export class QueryCinemaRoomDto extends PaginationQueryDto {
  @StringToBuffer()
  @IsOptional()
  cinema_id?: Uint8Array;
}
