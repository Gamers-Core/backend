import { Expose } from 'class-transformer';

import { Localize } from 'src/i18n';

export class ProductBrandDTO {
  @Expose()
  @Localize()
  name: string;
}
