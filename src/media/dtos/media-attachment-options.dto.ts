import { IsArray, IsIn, IsInt } from 'class-validator';
import { i18nKeyValidator } from 'src/i18n';
import { mediaEntityType, type MediaEntityType } from 'src/entity';

export class EntityAttachmentDTO {
  @IsInt({ message: i18nKeyValidator('isInt') })
  entityId: number;

  @IsIn(mediaEntityType, { message: i18nKeyValidator('isIn') })
  entityType: MediaEntityType;
}

export class MediaAttachmentOptionsDTO extends EntityAttachmentDTO {
  @IsInt({ each: true, message: i18nKeyValidator('isInt') })
  @IsArray({ message: i18nKeyValidator('isArray') })
  mediaIds: number[];
}
