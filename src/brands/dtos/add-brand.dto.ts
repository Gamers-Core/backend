import { IsInt, Min } from 'class-validator';

import { IsLocalized } from 'src/i18n/decorators/is-localized.decorator';
import type { Localized } from 'src/i18n/types';

export class AddBrandDTO {
  @IsLocalized()
  name: Localized;

  @IsInt()
  @Min(1)
  imageId: number;
}
