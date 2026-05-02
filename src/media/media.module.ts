import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CloudinaryProvider } from './cloudinary/cloudinary.provider';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { Media } from './entities/media.entity';
import { ProductMedia } from './entities/product-media.entity';
import { MediaController } from './media.controller';
import { MediaService } from './services/media.service';
import { ProductMediaService } from './services/product-media.service';

@Module({
  imports: [TypeOrmModule.forFeature([Media, ProductMedia])],
  controllers: [MediaController],
  providers: [MediaService, ProductMediaService, CloudinaryProvider, CloudinaryService],
  exports: [MediaService, ProductMediaService, CloudinaryService],
})
export class MediaModule {}
