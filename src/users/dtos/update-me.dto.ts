import { IsString, MinLength } from 'class-validator';
import { i18nKeyValidator } from 'src/i18n';

export class UpdateMeDTO {
  @IsString({ message: i18nKeyValidator('isString') })
  @MinLength(2, { message: i18nKeyValidator('minLength') })
  name: string;
}
