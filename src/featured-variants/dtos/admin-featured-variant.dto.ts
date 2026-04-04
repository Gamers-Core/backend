import { Expose, Type } from 'class-transformer';

import { AdminVariantDTO, VariantDTO } from 'src/products';

import { type Localized } from 'src/i18n';

export class AdminFeaturedVariantDTO {
  @Expose()
  id: number;

  @Expose()
  position: number;

  @Expose()
  title: Localized;

  @Expose()
  @Type(() => VariantDTO)
  variant: AdminVariantDTO;
}
