import { IsInt, IsUUID, Min } from 'class-validator';
import { i18nKeyValidator } from 'src/i18n';

export class CreateCartItemDTO {
  @IsUUID('4', { message: i18nKeyValidator('isUuid') })
  variantExternalId: string;

  @IsInt({ message: i18nKeyValidator('isInt') })
  @Min(1, { message: i18nKeyValidator('min') })
  quantity: number;
}
