import { Expose } from 'class-transformer';
import type { AuthPurpose } from '../types';

export class OtpDTO {
  @Expose()
  purpose: AuthPurpose;

  @Expose()
  sessionId: string;
}
