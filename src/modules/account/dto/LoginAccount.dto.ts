import { IsEmail, IsString } from 'class-validator';

export class LoginAccount {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
