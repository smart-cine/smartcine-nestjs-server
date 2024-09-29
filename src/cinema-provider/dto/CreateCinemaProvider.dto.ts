import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateCinemaProviderDto {
  @IsNotEmpty()
  name: string;

  @IsUrl()
  @IsNotEmpty()
  logo_url: string;

  @IsUrl()
  @IsNotEmpty()
  background_url: string;

  @IsString()
  @IsNotEmpty()
  country: string;
}
