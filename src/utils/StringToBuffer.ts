import { Transform } from 'class-transformer';
import { uuidToBinary } from './uuid';

export function StringToBuffer() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      return uuidToBinary(value);
    }

    throw new Error('Value must be a string!');
  });
}
