import { Expose, Transform } from 'class-transformer';

import { ProductMediaDTO } from './product-media.dto';

export class AdminProductMediaDTO extends ProductMediaDTO {
  @Expose()
  @Transform(({ obj, value }) => obj.media?.id ?? obj.id ?? value)
  id: number;

  @Expose()
  order: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
