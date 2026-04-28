import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Media, MediaAttachment } from 'src/entity';

import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { MediaAttachmentService } from './media-attachment.service';
import { CloudinaryProvider, CloudinaryService } from './cloudinary';

@Module({
  imports: [TypeOrmModule.forFeature([Media, MediaAttachment])],
  controllers: [MediaController],
  providers: [MediaService, MediaAttachmentService, CloudinaryProvider, CloudinaryService],
  exports: [MediaService, MediaAttachmentService, CloudinaryService],
})
export class MediaModule {}
