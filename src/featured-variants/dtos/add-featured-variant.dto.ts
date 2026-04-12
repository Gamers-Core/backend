import { IsInt, Min } from 'class-validator';
import { IsLocalized, type Localized } from 'src/i18n';

export class AddFeaturedVariantDTO {
  @IsInt()
  @Min(1)
  variantId: number;

  @IsLocalized()
  title: Localized;
}
