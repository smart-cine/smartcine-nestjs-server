import { Transform } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class UpdateCinemaLayoutDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  @IsOptional()
  rows?: number;

  @IsInt()
  @Transform(({ value }) => Number(value))
  @IsOptional()
  columns?: number;
}
