import { IsInt, IsUrl, Min } from 'class-validator';
import { i18nKeyValidator } from 'src/i18n';

export class AddUserReviewDTO {
  @IsInt({ message: i18nKeyValidator('isInt') })
  @Min(1, { message: i18nKeyValidator('min') })
  imageId: number;

  @IsUrl({}, { message: i18nKeyValidator('isUrl') })
  facebookURL: string;
}
