import { Expose, Type } from 'class-transformer';

import { Localize } from 'src/i18n/decorators/localize.decorator';
import { MediaDTO } from 'src/media/dtos/user/media.dto';

class SearchBrandDTO {
  @Expose()
  id: number;

  @Expose()
  @Localize()
  name: string;
}

class SearchCategoryDTO {
  @Expose()
  id: number;

  @Expose()
  @Localize()
  name: string;
}

class SearchPriceDTO {
  @Expose()
  min: number;

  @Expose()
  max: number;

  @Expose()
  sale: boolean;
}

export class SearchDTO {
  @Expose()
  id: number;

  @Expose()
  @Localize()
  name: string;

  @Expose()
  @Type(() => MediaDTO)
  image: MediaDTO | null;

  @Expose()
  @Type(() => SearchPriceDTO)
  price: SearchPriceDTO;

  @Expose()
  @Type(() => SearchBrandDTO)
  brand: SearchBrandDTO;

  @Expose()
  @Type(() => SearchCategoryDTO)
  category: SearchCategoryDTO;

  @Expose()
  hasStock: boolean;
}
