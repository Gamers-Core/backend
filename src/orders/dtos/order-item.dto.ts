import { Expose } from 'class-transformer';
import { Localize } from 'src/i18n';

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
  variantName: string;

  @Expose()
  quantity: number;

  @Expose()
  unitPrice: number;

  @Expose()
  lineTotal: number;
}
