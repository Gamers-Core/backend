import { Expose, Type } from 'class-transformer';

class ProductVariantPriceDTO {
  @Expose()
  amount: number;

  @Expose()
  compareAt?: number;

  @Expose()
  costPerItem?: number;
}

class ProductOptionVariantDTO {
  @Expose()
  name: string;

  @Expose()
  stock: number;

  @Expose()
  @Type(() => ProductVariantPriceDTO)
  price: ProductVariantPriceDTO;
}

class ProductOptionDTO {
  @Expose()
  name: string;

  @Expose()
  @Type(() => ProductOptionVariantDTO)
  variants: ProductOptionVariantDTO[];
}

class ProductMediaDTO {
  @Expose()
  id: number;

  @Expose()
  url: string;

  @Expose()
  publicId: string;

  @Expose()
  type: string;

  @Expose()
  width: number;

  @Expose()
  height: number;

  @Expose()
  format: string;

  @Expose()
  bytes: number;
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
  @Type(() => ProductOptionDTO)
  options?: ProductOptionDTO[] | null;

  @Expose()
  @Type(() => ProductMediaDTO)
  media: ProductMediaDTO[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
