import { MediaType } from 'src/entity';

import { MediaFolder } from './types';

export const mediaFolders = ['product', 'collection'] as const;

export const mediaFolderTypeMap = {
  product: 'auto',
  collection: 'image',
} as const satisfies Record<MediaFolder, MediaType>;
