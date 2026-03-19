import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { Serialize } from 'src/interceptors';

import { MediaService } from './media.service';
import { MediaDTO, UploadMediaDTO } from './dtos';
import { UploadedMediaFile } from './types';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Serialize(MediaDTO)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Body() body: UploadMediaDTO,
    @UploadedFile() file: UploadedMediaFile | undefined,
  ) {
    if (!file) throw new BadRequestException('File is required');

    return this.mediaService.create(file, body);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.mediaService.delete(id);
  }
}
