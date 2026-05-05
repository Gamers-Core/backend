import { Expose, Type } from 'class-transformer';

import { Localize } from 'src/i18n/decorators/localize.decorator';
import { MediaDTO } from 'src/media/dtos/user/media.dto';

export class BrandDTO {
  @Expose()
  id: number;

  @Expose()
  @Localize()
  name: string;

  @Expose()
  @Type(() => MediaDTO)
  image: MediaDTO | null;
}
