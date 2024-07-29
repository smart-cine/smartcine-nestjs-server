export function binaryToUuid(buffer: Buffer) {
  const hexString = buffer.toString('hex');
  return `${hexString.slice(0, 8)}-${hexString.slice(8, 12)}-${hexString.slice(12, 16)}-${hexString.slice(16, 20)}-${hexString.slice(20)}`;
}

export function uuidToBinary(uuid: string) {
  return Buffer.from(uuid.replace(/-/g, ''), 'hex');
}
