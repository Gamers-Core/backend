import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { CloudinaryService } from 'src/cloudinary';
import { Serialize } from 'src/interceptors';

import { MediaService } from './media.service';
import { MediaDTO, UploadMediaDTO } from './dtos';
import { UploadedMediaFile } from './types';

@Controller('media')
export class MediaController {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly mediaService: MediaService,
  ) {}

  @Serialize(MediaDTO)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Body() body: UploadMediaDTO,
    @UploadedFile() file: UploadedMediaFile | undefined,
  ) {
    if (!file) throw new BadRequestException('File is required');

    const result = await this.cloudinaryService.uploadBuffer(file, body.folder);

    return this.mediaService.create(result);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return this.mediaService.delete(id);
  }
}
