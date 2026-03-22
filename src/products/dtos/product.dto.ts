import { Expose, Type } from 'class-transformer';

import { MediaAttachmentDTO } from 'src/media';

class ProductVariantDTO {
  @Expose()
  id: number;

  @Expose()
  externalId: string;

  @Expose()
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
  name: string;
}

export class ProductDTO {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
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
