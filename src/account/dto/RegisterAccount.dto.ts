import { AccountRole } from '@prisma/client';
import { IsEmail, IsEnum, IsString } from 'class-validator';

export class RegisterAccount {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsEnum(AccountRole)
  role: AccountRole;

  @IsString()
  name: string;
}
