import { Transform, Type } from 'class-transformer';
import { IsDate, IsDateString, IsNumber, IsString } from 'class-validator';
import * as moment from 'moment';

export class VNPAYIPNDto {
  @IsString()
  vnp_Amount: number;

  @IsString()
  vnp_BankCode: string;

  @IsString()
  vnp_BankTranNo: string;

  @IsString()
  vnp_CardType: string;

  @IsString()
  vnp_OrderInfo: string;

  @IsString()
  vnp_PayDate: string;

  @IsString()
  vnp_ResponseCode: string;

  @IsString()
  vnp_TmnCode: string;

  @IsString()
  vnp_TransactionNo: string;

  @IsString()
  vnp_TransactionStatus: string;

  @IsString()
  vnp_TxnRef: string;

  @IsString()
  vnp_SecureHash: string;
}

/*
vnp_Amount: '5635300',
  vnp_BankCode: 'NCB',
  vnp_BankTranNo: 'VNP14570805',
  vnp_CardType: 'ATM',
  vnp_OrderInfo: 'Thanh toan hoa don',
  vnp_PayDate: '20240828194603',
  vnp_ResponseCode: '00',
  vnp_TmnCode: '15TGSMDP',
  vnp_TransactionNo: '14570805',
  vnp_TransactionStatus: '00',
  vnp_TxnRef: '92a55dec-9b49-432b-91a4-0f5d72c4688c',
  vnp_SecureHash: '8b2bcceb82da93c8135f54382091a90be5d8306a14e263a00601199c9b23f00fb8ea67aba48bae6770c55ffe846e55c6a41564b7cbac6dfea790083f172b67b8'
*/
