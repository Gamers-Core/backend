import { IsIn, IsNotEmpty, IsString } from 'class-validator';

import { type MediaEntityType, mediaEntityType } from 'src/entity';

export class UploadMediaDTO {
  @IsString()
  @IsNotEmpty()
  @IsIn(mediaEntityType)
  folder: MediaEntityType;
}
