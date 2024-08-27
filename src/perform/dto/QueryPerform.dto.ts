import { IsOptional } from 'class-validator';
import { PaginationQueryDto } from 'src/pagination/PaginationQuery.dto';
import { StringToBuffer } from 'src/utils/StringToBuffer';

export class QueryPerformDto extends PaginationQueryDto {
  @StringToBuffer()
  @IsOptional()
  cinema_id?: Buffer;
  // TODO: bỏ cinema_id, query ko cần where condition
}
