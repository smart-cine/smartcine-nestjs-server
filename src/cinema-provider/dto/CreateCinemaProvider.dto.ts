import { IsNotEmpty, IsUrl } from 'class-validator';

export class CreateCinemaProviderDto {
  @IsNotEmpty()
  name: string;

  @IsUrl()
  @IsNotEmpty()
  logo_url: string;

  @IsUrl()
  @IsNotEmpty()
  background_url: string;
}
