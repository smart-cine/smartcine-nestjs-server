import { AccountRole } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';

export class SessionDto {
  @IsString()
  id: string;

  @IsEnum(AccountRole)
  role: AccountRole;
}
