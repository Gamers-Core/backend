import { IsString } from 'class-validator';

export class ResendOTPDTO {
  @IsString()
  authId: string;
}
