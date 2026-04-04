import { Expose } from 'class-transformer';

import { Localize } from 'src/i18n';

export class BrandDTO {
  @Expose()
  @Localize()
  name: string;
}
