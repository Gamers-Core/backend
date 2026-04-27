import { IsInt, Min } from 'class-validator';

import { IsLocalized, type Localized } from 'src/i18n';

export class AddBrandDTO {
  @IsLocalized()
  name: Localized;

  @IsInt()
  @Min(1)
  imageId: number;
}
