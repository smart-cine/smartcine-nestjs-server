import { IsNotEmpty, IsString } from 'class-validator';

export class VNPAYDto {
  @IsString()
  @IsNotEmpty()
  vnp_TmnCode: string;

  @IsString()
  @IsNotEmpty()
  vnp_SecureHash: string;
}
