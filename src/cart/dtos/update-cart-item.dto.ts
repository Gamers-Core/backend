import { IsInt, Min } from 'class-validator';
import { i18nKeyValidator } from 'src/i18n';

export class UpdateCartItemDTO {
  @IsInt({ message: i18nKeyValidator('isInt') })
  @Min(0, { message: i18nKeyValidator('min') })
  quantity: number;
}
