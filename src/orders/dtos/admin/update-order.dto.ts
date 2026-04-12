import { IsInt } from 'class-validator';
import { i18nKeyValidator } from 'src/i18n';

export class UpdateOrderItemDTO {
  @IsInt({ message: i18nKeyValidator('isInt') })
  quantity: number;
}
