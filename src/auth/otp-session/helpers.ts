import { randomInt } from 'crypto';
import { hash } from 'bcrypt';

import { OTP_SESSION_PREFIX } from './const';

export const getSessionKey = (sessionId: string) => `${OTP_SESSION_PREFIX}:${sessionId}`;

export const generateOtp = () => randomInt(100000, 999999).toString();
export const generateHashedOtp = async (otp: string) => await hash(otp, 10);
