import { IsArray, IsInt, Min } from 'class-validator';
import { i18nKeyValidator } from 'src/i18n';

export class ReorderFeaturedVariantsDTO {
  @IsArray({ message: i18nKeyValidator('isArray') })
  @IsInt({ each: true, message: i18nKeyValidator('isInt') })
  @Min(1, { each: true, message: i18nKeyValidator('min') })
  orderedIds: number[];
}
