import { Expose, Type } from 'class-transformer';

import type { Localized } from 'src/i18n/types';
import { MediaDTO } from 'src/media/dtos/media.dto';

export class AdminBrandDTO {
  @Expose()
  id: number;

  @Expose()
  name: Localized;

  @Expose()
  @Type(() => MediaDTO)
  image: MediaDTO | null;
}
