import { IsOptional } from 'class-validator';
import { PaginationQueryDto } from 'src/pagination/PaginationQuery.dto';
import { StringToBuffer } from 'src/utils/StringToBuffer';

export class QueryCinemaRoomDto extends PaginationQueryDto {
  @StringToBuffer()
  @IsOptional()
  cinema_id?: Buffer;
}
