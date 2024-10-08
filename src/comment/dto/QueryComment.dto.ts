import { CommentType } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { PaginationQueryDto } from 'src/pagination/PaginationQuery.dto';
import { StringToBuffer } from 'src/utils/StringToBuffer';

export class QueryCommentDto extends PaginationQueryDto {
  @IsEnum(CommentType)
  type: CommentType;

  @StringToBuffer()
  @IsNotEmpty()
  dest_id: Buffer;
}
