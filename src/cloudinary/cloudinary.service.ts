import { BadRequestException, Injectable } from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiErrorResponse,
  UploadApiResponse,
  UploadStream,
} from 'cloudinary';

import { MediaFolder } from './types';
import { UploadedMediaFile } from 'src/media/types';
import { mediaFolderTypeMap } from './const';

@Injectable()
export class CloudinaryService {
  upload(file: string, folder: MediaFolder): Promise<UploadApiResponse> {
    return cloudinary.uploader.upload(file, { folder });
  }

  async uploadBuffer(
    file: UploadedMediaFile,
    folder: MediaFolder,
  ): Promise<UploadApiResponse> {
    this.validateFile(file, folder);

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

      stream.end(file.buffer);
    });
  }

  validateFile(file: UploadedMediaFile, folder: MediaFolder) {
    const allowedTypes = mediaFolderTypeMap[folder];

    if (allowedTypes === 'auto') return;

    const fileType = file.mimetype.split('/')[0];
    if (fileType !== allowedTypes)
      throw new BadRequestException(
        `Invalid file type. Allowed type: ${allowedTypes}`,
      );
  }

  destroy(publicId: string, invalidate = true) {
    return cloudinary.uploader.destroy(publicId, { invalidate });
  }
}
