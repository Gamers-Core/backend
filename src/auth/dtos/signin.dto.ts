import { IsEmail } from 'class-validator';

import { i18nKeyValidator } from 'src/i18n';

export class SigninDTO {
  @IsEmail({}, { message: i18nKeyValidator('isEmail') })
  email: string;
}
