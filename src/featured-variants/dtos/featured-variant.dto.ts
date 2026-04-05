import { Expose, Type } from 'class-transformer';
import { Localize } from 'src/i18n';

import { ProductDTO, VariantDTO } from 'src/products';

class VariantWithProductDTO extends VariantDTO {
  @Expose()
  @Type(() => ProductDTO)
  product: ProductDTO;
}

export class FeaturedVariantDTO {
  @Expose()
  @Localize()
  title: string;

  @Expose()
  @Type(() => VariantWithProductDTO)
  variant: VariantWithProductDTO;
}
