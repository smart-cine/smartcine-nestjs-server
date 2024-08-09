import { RatingType } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { PaginationQueryDto } from 'src/pagination/PaginationQuery.dto';
import { StringToBuffer } from 'src/utils/StringToBuffer';

export class QueryRatingDto extends PaginationQueryDto {
  @IsEnum(RatingType)
  type: RatingType;

  @StringToBuffer()
  @IsNotEmpty()
  dest_id: Buffer;
}
