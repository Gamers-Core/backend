import { IsLocalized, i18nKeyValidator, type Localized } from 'src/i18n';

export class AddBrandDTO {
  @IsLocalized({ message: i18nKeyValidator('isLocalized') })
  name: Localized;
}
