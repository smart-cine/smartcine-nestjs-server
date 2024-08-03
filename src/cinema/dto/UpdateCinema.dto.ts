import { IsOptional } from 'class-validator';

export class UpdateCinemaDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  address?: string;
}
