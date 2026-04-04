import { Expose, Transform } from 'class-transformer';

export class MediaAttachmentDTO {
  @Expose()
  @Transform(({ obj, value }) => obj.media?.url ?? obj.url ?? value)
  url: string;

  @Expose()
  order: number;
}
