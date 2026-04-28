import { MediaType } from 'src/entity';

import { UploadedMediaFile } from './types';

export const getFileType = (file: UploadedMediaFile): MediaType => file.mimetype.split('/')[0] as MediaType;
