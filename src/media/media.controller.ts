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

import { IsAdminAuthGuard } from 'src/auth/guards/is-admin-auth.guard';
import { BadRequestException } from 'src/common/exceptions';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';

import { mediaPolicyMap } from './cloudinary/const';
import { AdminMediaDTO } from './dtos/admin/admin-media.dto';
import { UploadMediaDTO } from './dtos/admin/upload-media.dto';
import { MediaService } from './services/media.service';
import { UploadedMediaFile } from './types';

@Controller('media')
@UseGuards(IsAdminAuthGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Serialize(AdminMediaDTO)
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: Math.max(...Object.values(mediaPolicyMap).map((policy) => policy.maxBytes)),
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype?.includes('/')) return cb(BadRequestException('media.invalidType'), false);

        cb(null, true);
      },
    }),
  )
  upload(@Body() body: UploadMediaDTO, @UploadedFile() file: UploadedMediaFile | undefined) {
    if (!file) throw BadRequestException('media.required');

    return this.mediaService.upload(file, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.mediaService.remove(id);
  }
}
