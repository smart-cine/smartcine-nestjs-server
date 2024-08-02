import { Transform } from 'class-transformer';
import { uuidToBinary } from './uuid';

export function StringToBuffer({ nullable = false } = {}) {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      return uuidToBinary(value);
    }

    if (!nullable) throw new Error('Value must be a string!');
  });
}
