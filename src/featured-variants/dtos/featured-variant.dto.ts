import { Expose, Type } from 'class-transformer';
import { Localize } from 'src/i18n';

import { VariantDTO } from 'src/products/dtos/user';

export class FeaturedVariantDTO {
  @Expose()
  @Localize()
  title: string;

  @Expose()
  @Type(() => VariantDTO)
  variant: VariantDTO;
}
