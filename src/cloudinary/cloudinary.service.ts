import { Injectable } from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiErrorResponse,
  UploadApiOptions,
  UploadApiResponse,
  UploadStream,
} from 'cloudinary';
import { MediaFolderType } from './types';

@Injectable()
export class CloudinaryService {
  upload(
    file: string,
    folder: MediaFolderType,
    options?: UploadApiOptions,
  ): Promise<UploadApiResponse> {
    return cloudinary.uploader.upload(file, { ...options, folder });
  }

  uploadBuffer(
    fileBuffer: Buffer,
    folder: MediaFolderType,
    options?: UploadApiOptions,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const stream: UploadStream = cloudinary.uploader.upload_stream(
        { ...options, folder },
        (error: UploadApiErrorResponse, result: UploadApiResponse) => {
          if (error) return reject(new Error(error.message));
          if (!result) return reject(new Error('Cloudinary upload failed.'));

          return resolve(result);
        },
      );

      stream.end(fileBuffer);
    });
  }

  destroy(publicId: string, invalidate = true) {
    return cloudinary.uploader.destroy(publicId, { invalidate });
  }
}
