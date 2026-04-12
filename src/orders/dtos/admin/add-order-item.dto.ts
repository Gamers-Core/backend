import { IsInt, IsUUID, Min } from 'class-validator';
import { i18nKeyValidator } from 'src/i18n';

export class AddOrderItemDTO {
  @IsUUID(undefined, { message: i18nKeyValidator('isUuid') })
  externalId: string;

  @IsInt({ message: i18nKeyValidator('isInt') })
  @Min(1, { message: i18nKeyValidator('min') })
  quantity: number;
}
