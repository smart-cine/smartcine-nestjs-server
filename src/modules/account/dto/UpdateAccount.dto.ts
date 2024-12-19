import { IsEmail, IsString } from 'class-validator';

export class UpdateAccount {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  name: string;
}
