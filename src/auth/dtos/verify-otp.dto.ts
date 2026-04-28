import { Transform } from 'class-transformer';
import { IsNumberString, IsString, MaxLength, MinLength } from 'class-validator';

export class VerifyOTPDTO {
  @IsString()
  sessionId: string;

  @Transform(({ value }) => `${value}`)
  @IsNumberString({ no_symbols: true })
  @MinLength(6)
  @MaxLength(6)
  otp: string;
}
