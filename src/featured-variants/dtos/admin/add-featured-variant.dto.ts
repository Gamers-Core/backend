import { IsInt, Min } from 'class-validator';

import { IsLocalized } from 'src/i18n/decorators/is-localized.decorator';
import type { Localized } from 'src/i18n/types';

export class AddFeaturedVariantDTO {
  @IsInt()
  @Min(1)
  variantId: number;

  @IsLocalized()
  title: Localized;
}
