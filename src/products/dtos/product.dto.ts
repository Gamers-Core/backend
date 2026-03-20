import { Expose, Type } from 'class-transformer';
import { MediaAttachmentDTO } from 'src/media';

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
  @Type(() => MediaAttachmentDTO)
  media: MediaAttachmentDTO[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
