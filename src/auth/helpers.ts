import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

export const getHashedPassword = async (
  password: string,
  salt: string,
  size = 32,
): Promise<Buffer> => (await scrypt(password, salt, size)) as Buffer;

export const getEncryptedPassword = async (password: string) => {
  const salt = randomBytes(8).toString('hex');

  const hashedPassword = await getHashedPassword(password, salt);

  return `${salt}.${hashedPassword.toString('hex')}` as const;
};
