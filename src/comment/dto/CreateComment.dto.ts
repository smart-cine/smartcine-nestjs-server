import { CommentType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { StringToBuffer } from 'src/utils/StringToBuffer';

export class CreateCommentDto {
  @IsEnum(CommentType)
  type: CommentType;

  @StringToBuffer()
  @IsNotEmpty()
  dest_id: Buffer;

  @IsNotEmpty()
  body: string;
}
