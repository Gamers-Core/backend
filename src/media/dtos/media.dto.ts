import { Expose } from 'class-transformer';

import type { MediaType } from 'src/entity';

export class MediaDTO {
  @Expose()
  id: number;

  @Expose()
  url: string;

  @Expose()
  publicId: string;

  @Expose()
  type: MediaType;

  @Expose()
  width: number;

  @Expose()
  height: number;

  @Expose()
  format: string;

  @Expose()
  bytes: number;
}
