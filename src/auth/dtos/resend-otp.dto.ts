import { IsString } from 'class-validator';
import { i18nKeyValidator } from 'src/i18n';

export class ResendOTPDTO {
  @IsString({ message: i18nKeyValidator('isString') })
  sessionId: string;
}
