import { BadRequestException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { v2, UploadApiErrorResponse, UploadApiResponse, UploadStream } from 'cloudinary';

import { UploadedMediaFile } from 'src/media';
import { MediaEntityType } from 'src/entity';

import { CLOUDINARY } from './cloudinary.provider';
import { mediaFolderTypeMap } from './const';

@Injectable()
export class CloudinaryService {
  constructor(@Inject(CLOUDINARY) private cloudinary: typeof v2) {}

  upload(file: string, folder: MediaEntityType): Promise<UploadApiResponse> {
    return this.cloudinary.uploader.upload(file, { folder });
  }

  async uploadBuffer(file: UploadedMediaFile, folder: MediaEntityType): Promise<UploadApiResponse> {
    this.validateFile(file, folder);

    return new Promise<UploadApiResponse>((resolve, reject) => {
      const stream: UploadStream = this.cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) return reject(new Error(error.message));
          if (!result) return reject(new Error('Cloudinary upload failed.'));

          return resolve(result);
        },
      );

      stream.end(file.buffer);
    });
  }

  validateFile(file: UploadedMediaFile, folder: MediaEntityType) {
    if (!file.mimetype?.includes('/')) {
      throw new BadRequestException('Invalid file type');
    }

    const allowedTypes = mediaFolderTypeMap[folder];

    if (!allowedTypes || allowedTypes === 'auto') return;

    const fileType = file.mimetype.split('/')[0];
    if (fileType !== allowedTypes) throw new BadRequestException(`Invalid file type. Allowed type: ${allowedTypes}`);
  }

  destroy(publicId: string, invalidate = true) {
    return this.cloudinary.uploader.destroy(publicId, { invalidate }).catch((err) => {
      throw new InternalServerErrorException(
        `Failed to delete media from Cloudinary: ${err instanceof Error ? err.message : String(err)}`,
      );
    });
  }
}
