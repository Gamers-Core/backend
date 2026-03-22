import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Media, MediaAttachment } from 'src/entity';
import { CloudinaryModule } from 'src/cloudinary';

import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { MediaAttachmentService } from './media-attachment.service';

@Module({
  imports: [TypeOrmModule.forFeature([Media, MediaAttachment]), CloudinaryModule],
  controllers: [MediaController],
  providers: [MediaService, MediaAttachmentService],
  exports: [MediaService, MediaAttachmentService],
})
export class MediaModule {}
