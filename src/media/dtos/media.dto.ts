import { Expose } from 'class-transformer';

export class MediaDTO {
  @Expose()
  id: number;

  @Expose()
  url: string;

  @Expose()
  publicId: string;

  @Expose()
  type: string;

  @Expose()
  status: string;

  @Expose()
  width: number;

  @Expose()
  height: number;

  @Expose()
  format: string;

  @Expose()
  bytes: number;

  @Expose()
  expiresAt: Date | null;

  @Expose()
  createdAt: Date;
}
