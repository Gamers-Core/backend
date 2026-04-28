import { IsArray, IsIn, IsInt } from 'class-validator';

import { mediaEntityType } from '../const';
import { type MediaEntityType } from '../types';

export class EntityAttachmentDTO {
  @IsInt()
  entityId: number;

  @IsIn(mediaEntityType)
  entityType: MediaEntityType;
}

export class MediaAttachmentOptionsDTO extends EntityAttachmentDTO {
  @IsInt({ each: true })
  @IsArray()
  mediaIds: number[];
}
