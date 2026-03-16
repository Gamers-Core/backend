import { Injectable } from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiErrorResponse,
  UploadApiResponse,
  UploadStream,
} from 'cloudinary';

import { MediaFolder } from './types';

@Injectable()
export class CloudinaryService {
  upload(file: string, folder: MediaFolder): Promise<UploadApiResponse> {
    return cloudinary.uploader.upload(file, { folder });
  }

  async uploadBuffer(
    fileBuffer: Buffer,
    folder: MediaFolder,
  ): Promise<UploadApiResponse> {
    return new Promise<UploadApiResponse>((resolve, reject) => {
      const stream: UploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
        },
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
