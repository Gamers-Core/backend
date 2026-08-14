import { UploadApiResponse } from 'cloudinary';
import { getPlaiceholder } from 'plaiceholder';
import { DeepPartial } from 'typeorm';

import { Media } from './entities/media.entity';
import { MediaType, UploadedMediaFile } from './types';

export const getFileType = (file: UploadedMediaFile): MediaType => file.mimetype.split('/')[0] as MediaType;

export const mapToMedia = ({
  resource_type,
  is_audio,
  public_id,
  secure_url,
  width,
  height,
  format,
  bytes,
}: UploadApiResponse): DeepPartial<Media> => {
  let type: MediaType;

  switch (resource_type) {
    case 'image':
      type = 'image';
      break;
    case 'video':
      type = is_audio ? 'audio' : 'video';
      break;
    case 'raw':
    case 'auto':
    default:
      type = 'raw';
  }

  return {
    publicId: public_id,
    src: secure_url,
    width,
    height,
    format,
    bytes,
    type,
  };
};

export const getBlurDataURL = async ({ type, src }: DeepPartial<Media>) => {
  if (type !== 'image' || !src) return null;

  const tinyUrl = src.replace('/upload/', `/upload/w_10,q_auto:low/`);

  const res = await fetch(tinyUrl)
    .then((r) => r.arrayBuffer())
    .then((buf) => getPlaiceholder(Buffer.from(buf), { size: 10 }))
    .then(({ base64 }) => base64)
    .catch(() => null);

  return res;
};
