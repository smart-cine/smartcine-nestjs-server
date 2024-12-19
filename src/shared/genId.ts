import { randomBytes } from 'crypto';
import { uuidToBinary } from '@/utils/uuid';
import { v4 } from 'uuid';

export function genId() {
  return uuidToBinary(v4());
}
