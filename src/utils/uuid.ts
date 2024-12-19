import { hexToUint8Array, uint8ArrayToHex } from "./common"

export function binaryToUuid<
  T extends Uint8Array | undefined | null,
  ResponseT extends T extends Uint8Array ? string : null,
>(buffer: T): ResponseT {
  if (!buffer) {
    return null as ResponseT;
  }
  const hexString = uint8ArrayToHex(buffer);
  return `${hexString.slice(0, 8)}-${hexString.slice(8, 12)}-${hexString.slice(12, 16)}-${hexString.slice(16, 20)}-${hexString.slice(20)}` as ResponseT;
}

export function uuidToBinary(uuid: string): Uint8Array {
  return hexToUint8Array(uuid.replace(/-/g, ''));
}
