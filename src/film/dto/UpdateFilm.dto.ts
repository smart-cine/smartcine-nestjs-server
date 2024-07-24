import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsDate,
  IsOptional,
} from 'class-validator';
import { StringToBuffer } from 'src/utils/StringToBuffer';

export class UpdateFilmDto {
  @StringToBuffer()
  @IsNotEmpty()
  @IsString()
  cinema_provider_id: Buffer;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  director: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsDate()
  release_date: Date;

  @IsNotEmpty()
  @IsString()
  country: string;

  @IsPositive()
  @IsNumber()
  @IsOptional()
  restrict_age: number;

  @IsPositive()
  @IsNumber()
  duration: number;

  @IsNotEmpty()
  @IsString()
  picture_url: string;

  @IsNotEmpty()
  @IsString()
  background_url: string;

  @IsNotEmpty()
  @IsString()
  trailer_url: string;

  @IsNotEmpty()
  @IsString()
  language: string;
}
