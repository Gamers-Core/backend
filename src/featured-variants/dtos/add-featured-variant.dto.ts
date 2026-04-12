import { IsInt, Min } from 'class-validator';
import { IsLocalized, i18nKeyValidator, type Localized } from 'src/i18n';

export class AddFeaturedVariantDTO {
  @IsInt({ message: i18nKeyValidator('isInt') })
  @Min(1, { message: i18nKeyValidator('min') })
  variantId: number;

  @IsLocalized({ message: i18nKeyValidator('isLocalized') })
  title: Localized;
}
