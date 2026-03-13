import { IsIn, IsNumberString, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

import { authPurposes } from '../const';
import type { AuthPurpose } from '../types';

export class VerifyOTPDTO<T extends AuthPurpose = AuthPurpose> {
  @IsIn(authPurposes)
  purpose: T;

  @IsString()
  sessionId: string;

  @Transform(({ value }) => `${value}`)
  @IsNumberString({ no_symbols: true })
  otp: string;
}
