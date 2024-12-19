import { IsNotEmpty } from 'class-validator'
import { PaginationQueryDto } from '@/common/pagination/PaginationQuery.dto';
import { StringToBuffer } from '@/utils/StringToBuffer'

export class QueryItemDto extends PaginationQueryDto {
  @StringToBuffer()
  @IsNotEmpty()
  cinema_id: Uint8Array
}
