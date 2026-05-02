import { Expose, Type } from 'class-transformer';

import type { Localized } from 'src/i18n/types';
import { AdminMediaDTO } from 'src/media/dtos/admin/admin-media.dto';

export class AdminBrandDTO {
  @Expose()
  id: number;

  @Expose()
  name: Localized;

  @Expose()
  @Type(() => AdminMediaDTO)
  image: AdminMediaDTO | null;
}
