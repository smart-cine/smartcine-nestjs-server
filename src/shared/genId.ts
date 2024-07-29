import { randomBytes } from 'crypto';
import { uuidToBinary } from 'src/utils/uuid';
import { v4 } from 'uuid';

export function genId() {
  return uuidToBinary(v4());
}
