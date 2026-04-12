import { IsNumberString, IsString, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { i18nKeyValidator } from 'src/i18n';

export class VerifyOTPDTO {
  @IsString({ message: i18nKeyValidator('isString') })
  sessionId: string;

  @Transform(({ value }) => `${value}`)
  @IsNumberString({ no_symbols: true }, { message: i18nKeyValidator('isNumberString') })
  @MinLength(6, { message: i18nKeyValidator('minLength') })
  @MaxLength(6, { message: i18nKeyValidator('maxLength') })
  otp: string;
}
