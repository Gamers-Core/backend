import { Expose } from 'class-transformer';

import type { MediaType } from 'src/media/types';

export class AdminMediaDTO {
  @Expose()
  id: number;

  @Expose()
  src: string;

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
