import { IsIn, IsNotEmpty, IsString } from 'class-validator';

import { type MediaEntityType, mediaEntityType } from 'src/entity';
import { i18nKeyValidator } from 'src/i18n';

export class UploadMediaDTO {
  @IsString({ message: i18nKeyValidator('isString') })
  @IsNotEmpty({ message: i18nKeyValidator('isNotEmpty') })
  @IsIn(mediaEntityType, { message: i18nKeyValidator('isIn') })
  folder: MediaEntityType;
}
