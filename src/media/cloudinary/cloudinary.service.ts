import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { v2, UploadApiErrorResponse, UploadApiResponse, UploadStream } from 'cloudinary';

import { BadRequestException } from 'src/common/exceptions';
import { ConfigService } from 'src/config/config.service';

import { mediaTypes } from '../const';
import { getFileType } from '../helpers';
import { MediaEntityType, MediaType, UploadedMediaFile } from '../types';

import { CLOUDINARY } from './cloudinary.provider';
import { mediaPolicyMap, mediaTypesMap } from './const';

@Injectable()
export class CloudinaryService {
  constructor(
    @Inject(CLOUDINARY) private cloudinary: typeof v2,
    private readonly configService: ConfigService,
  ) {}

  uploadBuffer(file: UploadedMediaFile, folder: MediaEntityType): Promise<UploadApiResponse> {
    this.validateFile(file, folder);

    const fileType = getFileType(file);
    const policy = mediaPolicyMap[folder];

    const folderPath = `${this.configService.environment}/${folder}`;

    return new Promise<UploadApiResponse>((resolve, reject) => {
      const stream: UploadStream = this.cloudinary.uploader.upload_stream(
        {
          folder: folderPath,
          resource_type: mediaTypesMap[fileType],
          transformation: policy.transformation,
          timeout: 100_000,
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error?.http_code === 499) return reject(BadRequestException('media.requestTimeout'));

          if (error || !result) return reject(BadRequestException('media.uploadFailed'));

          return resolve(result);
        },
      );

      stream.end(file.buffer);
    });
  }

  async destroy(publicId: string, resource_type: MediaType = 'image', invalidate = true) {
    const result = await this.cloudinary.uploader
      .destroy(publicId, { invalidate, resource_type: mediaTypesMap[resource_type] })
      .catch((err) => {
        throw new InternalServerErrorException(`Failed to delete from Cloudinary: ${err.message}`);
      });

    if (result.result !== 'ok') throw new InternalServerErrorException(`Cloudinary destroy failed: ${result.result}`);

    return result;
  }

  private validateFile(file: UploadedMediaFile, folder: MediaEntityType) {
    const policy = mediaPolicyMap[folder];

    if (file.size > policy.maxBytes)
      throw BadRequestException(['media.tooLarge', { maxSize: policy.maxBytes / 1024 / 1024 }]);

    const fileType = getFileType(file);

    const isSupportedType = mediaTypes.includes(fileType);
    if (!isSupportedType) throw BadRequestException('media.unsupportedType');

    if (policy.allowedType === 'all') return;

    if (fileType !== policy.allowedType)
      throw BadRequestException(['media.invalidTypeWithAllowed', { allowedTypes: policy.allowedType }]);
  }
}
