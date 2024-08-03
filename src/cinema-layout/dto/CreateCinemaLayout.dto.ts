import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateCinemaLayoutDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  rows: number;

  @IsInt()
  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  columns: number;
}
