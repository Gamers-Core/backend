import { Expose } from 'class-transformer';

import { Localize } from 'src/i18n';

export class CategoryDTO {
  @Expose()
  id: number;

  @Expose()
  @Localize()
  name: string;
}
