import { IsIn, IsNotEmpty, IsString } from 'class-validator';

import { mediaEntityType } from '../../const';
import { type MediaEntityType } from '../../types';

export class UploadMediaDTO {
  @IsString()
  @IsNotEmpty()
  @IsIn(mediaEntityType)
  folder: MediaEntityType;
}
