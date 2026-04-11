import { Expose } from 'class-transformer';

export class OtpDTO {
  @Expose()
  sessionId: string;
}
