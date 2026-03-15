import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { CloudinaryService } from 'src/cloudinary';
import type { MediaFolder } from 'src/cloudinary';

import { MediaService } from './media.service';

@Controller('media')
export class MediaController {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly mediaService: MediaService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Body('folder') folder: MediaFolder,
    @UploadedFile() file: { buffer: Buffer } | undefined,
  ) {
    if (!file) throw new BadRequestException('File is required');

    const result = await this.cloudinaryService.uploadBuffer(
      file.buffer,
      folder,
    );

    return this.mediaService.create({
      ...result,
      publicId: result.public_id,
      url: result.secure_url,
      type: result.resource_type,
    });
  }
}
