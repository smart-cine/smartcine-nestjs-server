import { IsNotEmpty } from 'class-validator'
import { PaginationQueryDto } from 'src/pagination/PaginationQuery.dto';
import { StringToBuffer } from 'src/utils/StringToBuffer'

export class QueryItemDto extends PaginationQueryDto {
  @StringToBuffer()
  @IsNotEmpty()
  cinema_id: Buffer
}
