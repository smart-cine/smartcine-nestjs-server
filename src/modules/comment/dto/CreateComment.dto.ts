import { CommentType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { StringToBuffer } from '@/utils/StringToBuffer';

export class CreateCommentDto {
  @IsEnum(CommentType)
  type: CommentType;

  @StringToBuffer()
  @IsNotEmpty()
  dest_id: Uint8Array;

  @IsNotEmpty()
  body: string;
}
