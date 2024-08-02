import { IsOptional } from 'class-validator';
import { PaginationQueryDto } from 'src/pagination/PaginationQuery.dto';
import { StringToBuffer } from 'src/utils/StringToBuffer';

export class QueryPerformDto extends PaginationQueryDto {
  @StringToBuffer({ nullable: true })
  @IsOptional()
  cinema_id?: Buffer;
}
