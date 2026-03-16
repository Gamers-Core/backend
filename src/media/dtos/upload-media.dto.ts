import { IsIn, IsNotEmpty } from 'class-validator';

import { mediaFolders } from 'src/cloudinary';
import type { MediaFolder } from 'src/cloudinary';

export class UploadMediaDTO {
  @IsNotEmpty()
  @IsIn(mediaFolders)
  folder: MediaFolder;
}
