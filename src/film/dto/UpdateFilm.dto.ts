import { PartialType, PickType } from '@nestjs/mapped-types';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsDate,
  IsOptional,
} from 'class-validator';
import { StringToBuffer } from 'src/utils/StringToBuffer';
import { CreateFilmDto } from './CreateFilm.dto';

export class UpdateFilmDto extends PartialType(
  PickType(CreateFilmDto, [
    'title',
    'director',
    'description',
    'release_date',
    'country',
    'restrict_age',
    'duration',
    'picture_url',
    'background_url',
    'trailer_url',
    'language',
  ]),
) {}
