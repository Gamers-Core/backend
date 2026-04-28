import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CloudinaryProvider } from './cloudinary/cloudinary.provider';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { MediaAttachment } from './entities/media-attachment.entity';
import { Media } from './entities/media.entity';
import { MediaAttachmentService } from './media-attachment.service';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';

@Module({
  imports: [TypeOrmModule.forFeature([Media, MediaAttachment])],
  controllers: [MediaController],
  providers: [MediaService, MediaAttachmentService, CloudinaryProvider, CloudinaryService],
  exports: [MediaService, MediaAttachmentService, CloudinaryService],
})
export class MediaModule {}
