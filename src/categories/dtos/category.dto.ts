import { Expose } from 'class-transformer';

import { Localize } from 'src/i18n/decorators/localize.decorator';

export class CategoryDTO {
  @Expose()
  id: number;

  @Expose()
  @Localize()
  name: string;
}
