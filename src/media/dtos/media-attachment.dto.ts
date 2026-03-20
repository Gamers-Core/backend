import { Expose, Transform } from 'class-transformer';

export class MediaAttachmentDTO {
  @Expose()
  @Transform(({ obj, value }) => obj.media?.id ?? obj.id ?? value)
  id: number;

  @Expose()
  @Transform(({ obj, value }) => obj.media?.url ?? obj.url ?? value)
  url: string;

  @Expose()
  order: number;

  @Expose()
  @Transform(({ obj }) => obj.order === 1)
  isPrimary: boolean;
}
