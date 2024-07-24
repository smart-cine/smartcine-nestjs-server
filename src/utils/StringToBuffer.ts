import { Transform } from 'class-transformer';

export function StringToBuffer() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      return Buffer.from(value);
    }
    throw new Error('Value must be a string!');
  });
}
