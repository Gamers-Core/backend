import { Expose } from 'class-transformer';

import type { Localized } from 'src/i18n/types';

export class AdminCategoryDTO {
  @Expose()
  id: number;

  @Expose()
  name: Localized;
}
