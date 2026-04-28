import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { Serialize } from 'src/interceptors';
import { BadRequestException } from 'src/common';
import { IsAdminAuthGuard } from 'src/guards/is-admin-auth.guard';

import { MediaService } from './media.service';
import { MediaDTO, UploadMediaDTO } from './dtos';
import { UploadedMediaFile } from './types';
import { mediaPolicyMap } from './cloudinary';

@Controller('media')
@UseGuards(IsAdminAuthGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Serialize(MediaDTO)
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: Math.max(...Object.values(mediaPolicyMap).map((policy) => policy.maxBytes)),
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype?.includes('/')) return cb(new BadRequestException('media.invalidType'), false);

        cb(null, true);
      },
    }),
  )
  async upload(@Body() body: UploadMediaDTO, @UploadedFile() file: UploadedMediaFile | undefined) {
    if (!file) throw new BadRequestException('media.required');

    return this.mediaService.create(file, body);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.mediaService.delete(id);
  }
}
