import { IsOptional, IsUrl } from 'class-validator';

export class UpdateCinemaProviderDto {
  @IsOptional()
  name?: string;

  @IsUrl()
  @IsOptional()
  logo_url?: string;

  @IsUrl()
  @IsOptional()
  background_url?: string;
}
