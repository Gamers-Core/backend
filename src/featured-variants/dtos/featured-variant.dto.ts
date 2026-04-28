import { Expose, Type } from 'class-transformer';

import { Localize } from 'src/i18n/decorators/localize.decorator';
import { ProductDTO } from 'src/products/dtos/user/product.dto';
import { VariantDTO } from 'src/products/dtos/user/variant.dto';

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
