import { Expose } from 'class-transformer';

import { type Localized } from 'src/i18n';

export class AdminProductBrandDTO {
  @Expose()
  id: number;

  @Expose()
  name: Localized;
}
