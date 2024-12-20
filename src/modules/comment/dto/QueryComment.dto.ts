import { CommentType } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { PaginationQueryDto } from '@/common/pagination/PaginationQuery.dto';
import { StringToBuffer } from '@/utils/StringToBuffer';

export class QueryCommentDto extends PaginationQueryDto {
  @IsEnum(CommentType)
  type: CommentType;

  @StringToBuffer()
  @IsNotEmpty()
  dest_id: Uint8Array;
}
