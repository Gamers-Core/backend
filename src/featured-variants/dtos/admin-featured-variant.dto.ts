import { Expose, Type } from 'class-transformer';

import { AdminProductDTO, AdminVariantDTO } from 'src/products';
import { type Localized } from 'src/i18n';

class AdminVariantWithProductDTO extends AdminVariantDTO {
  @Expose()
  @Type(() => AdminProductDTO)
  product: AdminProductDTO;
}

export class AdminFeaturedVariantDTO {
  @Expose()
  id: number;

  @Expose()
  position: number;

  @Expose()
  title: Localized;

  @Expose()
  @Type(() => AdminVariantWithProductDTO)
  variant: AdminVariantWithProductDTO;
}
