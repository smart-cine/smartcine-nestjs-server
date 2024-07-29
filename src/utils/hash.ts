import * as bcrypt from 'bcrypt';

const saltOrRounds = 10;

export async function hash(password: string) {
  return bcrypt.hash(password, saltOrRounds);
}
