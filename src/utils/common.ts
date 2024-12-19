import * as crypto from 'crypto';

export function convertJwtExpireToSeconds(expire: string): number {
  // JWT_EXPIRES_IN = 10s, 60s, 1m, 1h, 1d, 1w, 1y
  const time = expire.match(/\d+/g);
  if (!time) {
    return 0;
  }
  const unit = expire.match(/\D+/g);
  if (!unit) {
    return 0;
  }
  const unitString = unit[0];
  switch (unitString) {
    case 's':
      return parseInt(time[0]);
    case 'm':
      return parseInt(time[0]) * 60;
    case 'h':
      return parseInt(time[0]) * 60 * 60;
    case 'd':
      return parseInt(time[0]) * 60 * 60 * 24;
    case 'w':
      return parseInt(time[0]) * 60 * 60 * 24 * 7;
    case 'y':
      return parseInt(time[0]) * 60 * 60 * 24 * 365;
    default:
      return 0;
  }
}

export function hash(
  secret: string,
  data: crypto.BinaryLike,
  algorithm: 'SHA256' | 'SHA512' | 'MD5' = 'SHA256',
): string {
  return crypto.createHmac(algorithm, secret).update(data).digest('hex');
}

export function isEqualBytes(
  bytes1: Uint8Array,
  bytes2: Uint8Array
): boolean {
  if (bytes1.length !== bytes2.length) {
    return false;
  }

  for (let i = 0; i < bytes1.length; i++) {
    if (bytes1[i] !== bytes2[i]) {
      return false;
    }
  }

  return true;
}

export function uint8ArrayToHex(array: Uint8Array): string {
  const hexChars: string[] = [];
  for (let i = 0; i < array.length; i++) {
    const byte = array[i];
    hexChars.push((byte >>> 4).toString(16));
    hexChars.push((byte & 0x0f).toString(16));
  }
  return hexChars.join('');
}

export function hexToUint8Array(hexString: string): Uint8Array {
  if (hexString.length % 2 !== 0) {
    throw new Error("Invalid hex string length");
  }

  const byteArray = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < byteArray.length; i++) {
    byteArray[i] = parseInt(hexString.slice(i * 2, i * 2 + 2), 16);
  }
  return byteArray;
}
