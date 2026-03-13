import { IsNumberString, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class VerifyOTPDTO {
  @IsString()
  authId: string;

  @Transform(({ value }) => `${value}`)
  @IsNumberString({ no_symbols: true })
  otp: string;
}
