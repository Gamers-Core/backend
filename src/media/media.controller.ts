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

import { MediaService } from './media.service';
import { UploadMediaDTO } from './dtos';

@Controller('media')
export class MediaController {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly mediaService: MediaService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Body() body: UploadMediaDTO,
    @UploadedFile() file: UploadMediaDTO['file'],
  ) {
    if (!file) throw new BadRequestException('File is required');

    const result = await this.cloudinaryService.uploadBuffer(
      file.buffer,
      body.folder,
    );

    return this.mediaService.create(result);
  }
}
