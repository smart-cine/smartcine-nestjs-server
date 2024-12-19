import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateItemDto } from './CreateItem.dto';

export class UpdateItemDto extends PartialType(
  PickType(CreateItemDto, ['name', 'discount', 'price']),
) {}
