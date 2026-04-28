import { mediaEntityType, mediaTypes } from './const';

export interface UploadedMediaFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export type MediaType = (typeof mediaTypes)[number];
export type MediaEntityType = (typeof mediaEntityType)[number];
