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

import { BadRequestException } from 'src/common/exceptions';
import { IsAdminAuthGuard } from 'src/guards/is-admin-auth.guard';
import { Serialize } from 'src/interceptors/serialize.interceptor';

import { mediaPolicyMap } from './cloudinary/const';
import { MediaDTO } from './dtos/media.dto';
import { UploadMediaDTO } from './dtos/upload-media.dto';
import { MediaService } from './media.service';
import { UploadedMediaFile } from './types';

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
