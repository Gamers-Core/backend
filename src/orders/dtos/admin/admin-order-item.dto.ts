import { Expose } from 'class-transformer';

import type { Localized } from 'src/i18n/types';

export class AdminOrderItemDTO {
  @Expose()
  id: number;

  @Expose()
  productId: number;

  @Expose()
  productTitle: Localized;

  @Expose()
  variantExternalId: string;

  @Expose()
  variantName: Localized | null;

  @Expose()
  imageURL: string | null;

  @Expose()
  quantity: number;

  @Expose()
  unitPrice: number;

  @Expose()
  lineTotal: number;
}
