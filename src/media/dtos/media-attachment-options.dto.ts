import { IsArray, IsIn, IsInt } from 'class-validator';
import { mediaEntityType, type MediaEntityType } from 'src/entity';

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
