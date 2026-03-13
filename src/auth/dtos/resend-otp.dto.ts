import { IsString } from 'class-validator';

export class ResendOTPDTO {
  @IsString()
  sessionId: string;
}
