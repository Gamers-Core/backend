import { ArrayMaxSize, ArrayMinSize, IsArray, IsInt, Min } from 'class-validator';
import { i18nKeyValidator } from 'src/i18n';

export class ReorderUserReviewsDTO {
  @IsArray({ message: i18nKeyValidator('isArray') })
  @IsInt({ each: true, message: i18nKeyValidator('isInt') })
  @Min(1, { each: true, message: i18nKeyValidator('min') })
  @ArrayMaxSize(3, { message: i18nKeyValidator('arrayMaxSize') })
  @ArrayMinSize(3, { message: i18nKeyValidator('arrayMinSize') })
  ids: number[];
}
