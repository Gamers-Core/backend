import { Expose, Transform } from 'class-transformer';

import type { MediaType } from '../types';

export class MediaAttachmentDTO {
  @Expose()
  @Transform(({ obj, value }) => obj.media?.url ?? obj.url ?? value)
  url: string;

  @Expose()
  @Transform(({ obj, value }) => obj.media?.type ?? obj.type ?? value)
  type: MediaType;

  @Expose()
  @Transform(({ obj, value }) => obj.media?.width ?? obj.width ?? value)
  width: number;

  @Expose()
  @Transform(({ obj, value }) => obj.media?.height ?? obj.height ?? value)
  height: number;

  @Expose()
  @Transform(({ obj, value }) => obj.media?.format ?? obj.format ?? value)
  format: string;

  @Transform(({ obj, value }) => obj.media?.bytes ?? obj.bytes ?? value)
  @Expose()
  bytes: number;
}
