import { IsIn, IsString } from 'class-validator';

import { authPurposes } from '../const';
import type { AuthPurpose } from '../types';

export class ResendOTPDTO<P extends AuthPurpose = AuthPurpose> {
  @IsIn(authPurposes)
  purpose: P;

  @IsString()
  sessionId: string;
}
