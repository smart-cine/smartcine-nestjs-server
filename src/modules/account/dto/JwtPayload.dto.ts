import { AccountRole } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { StringToBuffer } from 'src/utils/StringToBuffer';

export class JwtPayloadDto {
  @StringToBuffer()
  @IsNotEmpty()
  id: Uint8Array;

  @IsEnum(AccountRole)
  role: AccountRole;
}
