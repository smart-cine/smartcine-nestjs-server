import { Transform } from 'class-transformer';
import { uuidToBinary } from './uuid';

export function StringToBuffer() {
  return Transform(({ value }) => {
    if (!value) {
      return ""
    }
    if (typeof value !== 'string') {
      throw new Error('Value must be a string');
    }
    if (value.length !== 36) {
      throw new Error('Value must be a valid UUID');
    }
    return uuidToBinary(String(value));
  });
}
