import { Expose, Type } from 'class-transformer';

import type { Localized } from 'src/i18n/types';
import { AdminProductDTO } from 'src/products/dtos/admin/admin-product.dto';
import { AdminVariantDTO } from 'src/products/dtos/admin/admin-variant.dto';

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
