import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { UploadApiResponse } from 'cloudinary';
import { In, IsNull, LessThan, Repository } from 'typeorm';

import { Media } from 'src/entity';
import { CloudinaryService } from 'src/cloudinary';

@Injectable()
export class MediaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MediaService.name);
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  onModuleInit() {
    void this.cleanupExpiredDraftMedia();

    this.cleanupInterval = setInterval(
      () => void this.cleanupExpiredDraftMedia(),
      60 * 60 * 1000, // Run cleanup every hour
    );
  }

  onModuleDestroy() {
    if (!this.cleanupInterval) return;

    clearInterval(this.cleanupInterval);
  }

  async create(result: UploadApiResponse): Promise<Media> {
    const media = this.mediaRepository.create({
      publicId: result.public_id,
      url: result.secure_url,
      type: result.resource_type,
      status: 'draft',
      expiresAt: this.getDraftExpiryDate(),
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    });

    try {
      return await this.mediaRepository.save(media);
    } catch (error) {
      try {
        await this.cloudinaryService.destroy(result.public_id);
      } catch (destroyError) {
        this.logger.warn(
          `Media DB save failed and Cloudinary cleanup failed for ${result.public_id}: ${destroyError instanceof Error ? destroyError.message : String(destroyError)}`,
        );
      }

      throw error;
    }
  }

  async assertDraftMediaIdsAttachable(
    mediaIds: number[],
    mediaRepository: Repository<Media> = this.mediaRepository,
  ) {
    if (!mediaIds.length) return;

    const uniqueMediaIds = [...new Set(mediaIds)];

    const media = await mediaRepository.find({
      where: { id: In(uniqueMediaIds) },
      relations: { product: true },
      select: { id: true, status: true, product: { id: true } },
    });

    if (media.length !== uniqueMediaIds.length)
      throw new BadRequestException('Some media items are invalid.');

    const hasInvalidMedia = media.some(
      (item) => item.status !== 'draft' || !!item.product,
    );

    if (hasInvalidMedia)
      throw new BadRequestException('Some media items are unavailable.');
  }

  async attachMediaToProduct(
    mediaIds: number[],
    productId: number,
    mediaRepository: Repository<Media> = this.mediaRepository,
  ): Promise<void> {
    if (!mediaIds.length) return;

    const uniqueMediaIds = [...new Set(mediaIds)];

    const result = await mediaRepository.update(
      {
        id: In(uniqueMediaIds),
        status: 'draft',
        product: IsNull(),
      },
      {
        status: 'attached',
        product: { id: productId },
        expiresAt: null,
      },
    );

    if (result.affected !== uniqueMediaIds.length) {
      throw new BadRequestException('Some media items are unavailable.');
    }
  }

  async cleanupExpiredDraftMedia() {
    try {
      const expiredDraftMedia = await this.mediaRepository.find({
        where: {
          status: 'draft',
          product: IsNull(),
          expiresAt: LessThan(new Date()),
        },
        select: {
          id: true,
          publicId: true,
        },
      });

      if (!expiredDraftMedia.length) return;

      const deletedMediaIds: number[] = [];

      for (const media of expiredDraftMedia) {
        try {
          await this.cloudinaryService.destroy(media.publicId);
          deletedMediaIds.push(media.id);
        } catch (error) {
          this.logger.warn(
            `Failed to delete media with publicId ${media.publicId} from Cloudinary: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }

      if (!deletedMediaIds.length) return;

      await this.mediaRepository.delete({ id: In(deletedMediaIds) });
    } catch (error) {
      this.logger.error(
        'Failed to cleanup expired draft media',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  private getDraftExpiryDate() {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    return expiresAt;
  }
}
