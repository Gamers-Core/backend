import { MediaEntityType, MediaType } from '../types';

import { CloudinaryResourceType, MediaFormat, MediaPolicy } from './types';

const definePolicy = <T extends MediaFormat>(policy: MediaPolicy<T>): MediaPolicy<T> => policy;

export const mediaPolicyMap = {
  product: definePolicy({
    allowedType: 'all',
    maxBytes: 100 * 1024 * 1024,
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  }),
  variant: definePolicy({
    allowedType: 'image',
    maxBytes: 10 * 1024 * 1024,
    transformation: [
      { quality: 'auto', fetch_format: 'auto' },
      { width: 1000, height: 1000, crop: 'limit', aspect_ratio: '1:1' },
    ],
  }),
  brand: definePolicy({
    allowedType: 'image',
    maxBytes: 5 * 1024 * 1024,
    transformation: [
      { quality: 'auto', fetch_format: 'auto' },
      { width: 500, height: 500, crop: 'limit', aspect_ratio: '16:9' },
    ],
  }),
  'user-review': definePolicy({
    allowedType: 'image',
    maxBytes: 10 * 1024 * 1024,
    transformation: [
      { quality: 'auto', fetch_format: 'auto' },
      { width: 800, height: 800, crop: 'limit' },
    ],
  }),
} satisfies Record<MediaEntityType, MediaPolicy<MediaFormat>>;

export const mediaTypesMap = {
  image: 'image',
  video: 'video',
  audio: 'video',
} as const satisfies Record<MediaType, CloudinaryResourceType>;
