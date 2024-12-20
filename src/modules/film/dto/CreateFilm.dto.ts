import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsDate,
  IsOptional,
} from 'class-validator';
import { StringToBuffer } from '@/utils/StringToBuffer';

export class CreateFilmDto {
  @StringToBuffer()
  @IsNotEmpty()
  @IsString()
  cinema_provider_id: Uint8Array;

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

  @IsNotEmpty({ each: true })
  @IsString({ each: true })
  tags: string[];
}
