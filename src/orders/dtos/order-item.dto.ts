import { Expose } from 'class-transformer';

import { Localize } from 'src/i18n/decorators/localize.decorator';

export class OrderItemDTO {
  @Expose()
  productId: number;

  @Expose()
  @Localize()
  productTitle: string;

  @Expose()
  variantExternalId: string;

  @Expose()
  @Localize()
  variantName: string | null;

  @Expose()
  imageURL: string | null;

  @Expose()
  quantity: number;

  @Expose()
  unitPrice: number;

  @Expose()
  lineTotal: number;
}
