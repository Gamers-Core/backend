import { Expose, Type } from 'class-transformer';

class ProductOptionVariantDTO {
  @Expose()
  amount: number;

  @Expose()
  costPerItem: number;

  @Expose()
  compareAt: number | null;

  @Expose()
  name: string;

  @Expose()
  stock: number;
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
