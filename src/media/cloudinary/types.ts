import { CommonTransformationOptions, ImageTransformationOptions, VideoTransformationOptions } from 'cloudinary';

import { MediaType } from '../types';

export type MediaFormat = 'all' | MediaType;

type Transformation<T extends MediaFormat = 'all'> = T extends 'image'
  ? ImageTransformationOptions
  : T extends 'video' | 'audio'
    ? VideoTransformationOptions
    : CommonTransformationOptions;

export interface MediaPolicy<T extends MediaFormat = 'all'> {
  allowedType: T;
  maxBytes: number;
  transformation?: Transformation<T>[];
}

export type CloudinaryResourceType = 'image' | 'video' | 'raw';
