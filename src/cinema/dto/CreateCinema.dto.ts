import { IsNotEmpty } from 'class-validator';

export class CreateCinemaDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  address: string;
}
