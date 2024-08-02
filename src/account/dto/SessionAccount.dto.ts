import { AccountRole } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { StringToBuffer } from 'src/utils/StringToBuffer';

export class SessionAccount {
  @StringToBuffer()
  @IsNotEmpty()
  id: Buffer;

  @IsEnum(AccountRole)
  role: AccountRole;
}
