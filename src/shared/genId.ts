import { randomBytes } from 'crypto';

export function genId() {
  return randomBytes(16);
}
