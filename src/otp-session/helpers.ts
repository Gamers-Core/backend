import { randomBytes, randomInt, scrypt as _scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

import { OTP_SESSION_PREFIX } from './const';

const scrypt = promisify(_scrypt);

export const getSessionKey = (sessionId: string) => `${OTP_SESSION_PREFIX}:${sessionId}`;

export const generateOtp = () => randomInt(100000, 999999).toString();
export const generateHashedOtp = async (otp: string) => {
  const salt = randomBytes(16).toString('hex');
  const hashedOtp = (await scrypt(otp, salt, 32)) as Buffer;

  return `${salt}.${hashedOtp.toString('hex')}`;
};

export const compareHashedOtp = async (otp: string, encryptedOtp: string) => {
  const [salt, hash] = encryptedOtp.split('.');
  if (!salt || !hash) return false;

  const computedHash = (await scrypt(otp, salt, 32)) as Buffer;
  const expectedHash = Buffer.from(hash, 'hex');

  return expectedHash.length === computedHash.length && timingSafeEqual(expectedHash, computedHash);
};
