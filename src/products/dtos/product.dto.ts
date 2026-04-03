import { Expose, Type } from 'class-transformer';

import { Localize } from 'src/i18n';
import { MediaAttachmentDTO } from 'src/media';

class ProductVariantDTO {
  @Expose()
  id: number;

  @Expose()
  externalId: string;

  @Expose()
  @Localize()
  name: string | null;

  @Expose()
  isDefault: boolean;

  @Expose()
  isActive: boolean;

  @Expose()
  stock: number;

  @Expose()
  price: number;

  @Expose()
  costPerItem: number;

  @Expose()
  compareAt: number | null;

  @Expose()
  @Type(() => MediaAttachmentDTO)
  media: MediaAttachmentDTO[];
}

class ProductBrandDTO {
  @Expose()
  id: number;

  @Expose()
  @Localize()
  name: string;
}

export class ProductDTO {
  @Expose()
  id: number;

  @Expose()
  @Localize()
  title: string;

  @Expose()
  @Localize()
  description: string;

  @Expose()
  status: string;

  @Expose()
  @Type(() => ProductVariantDTO)
  variants: ProductVariantDTO[];

  @Expose()
  @Type(() => MediaAttachmentDTO)
  media: MediaAttachmentDTO[];

  @Expose()
  @Type(() => ProductBrandDTO)
  brand: ProductBrandDTO | null;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
