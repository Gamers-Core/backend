import { Expose } from 'class-transformer';

import type { MediaType } from 'src/media/types';

export class MediaDTO {
  @Expose()
  src: string;

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
