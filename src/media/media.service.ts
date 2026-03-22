import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Media, MediaAttachment } from 'src/entity';
import { CloudinaryService } from 'src/cloudinary';
import { UploadedMediaFile } from './types';
import { UploadMediaDTO } from './dtos';

@Injectable()
export class MediaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MediaService.name);
  private cleanupInterval: NodeJS.Timeout | null = null;
  private isCleanupRunning = false;

  constructor(
    private readonly cloudinaryService: CloudinaryService,
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
  ) {}

  onModuleInit() {
    void this.runExpiredDraftCleanup();

    this.cleanupInterval = setInterval(
      () => void this.runExpiredDraftCleanup(),
      60 * 60 * 1000, // Run cleanup every hour
    );
  }

  onModuleDestroy() {
    if (!this.cleanupInterval) return;

    clearInterval(this.cleanupInterval);
  }

  async create(file: UploadedMediaFile, mediaDTO: UploadMediaDTO) {
    const result = await this.cloudinaryService.uploadBuffer(file, mediaDTO.folder);

    const media = this.mediaRepository.create({
      publicId: result.public_id,
      url: result.secure_url,
      type: result.resource_type,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      expiresAt: this.getDraftExpiryDate(),
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

      this.logger.error(
        `Failed to save media record for publicId ${result.public_id}: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException('Failed to save media record');
    }
  }

  async delete(id: number) {
    const media = await this.mediaRepository.findOne({
      where: { id },
      select: { publicId: true },
    });

    if (!media) throw new NotFoundException('Media not found');

    try {
      await this.cloudinaryService.destroy(media.publicId);
    } catch (error) {
      this.logger.error(
        `Failed to delete media with publicId ${media.publicId} from Cloudinary during media deletion: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw error;
    }

    await this.mediaRepository.delete(id);
  }

  async cleanupExpiredDraftMedia() {
    const now = new Date();

    try {
      const expiredDraftMedia = await this.mediaRepository
        .createQueryBuilder('m')
        .select(['m.id', 'm.publicId'])
        .where('m.expiresAt IS NOT NULL')
        .andWhere('m.expiresAt < :now', { now })
        .andWhere('m.isDeleted = :isDeleted', { isDeleted: false })
        .andWhere((qb) => {
          const subQuery = qb.subQuery().select('1').from(MediaAttachment, 'ma').where('ma.mediaId = m.id').getQuery();

          return `NOT EXISTS ${subQuery}`;
        })
        .getMany();

      if (!expiredDraftMedia.length) return;

      const softDeletedMedia: Array<{ id: number; publicId: string }> = [];

      await Promise.all(
        expiredDraftMedia.map(async (media) => {
          const updateResult = await this.mediaRepository
            .createQueryBuilder()
            .update(Media)
            .set({ isDeleted: true })
            .where('id = :id', { id: media.id })
            .andWhere('isDeleted = :isDeleted', { isDeleted: false })
            .andWhere('expiresAt IS NOT NULL')
            .andWhere('expiresAt < :now', { now })
            .andWhere('NOT EXISTS (SELECT 1 FROM media_attachment ma WHERE ma.mediaId = :id)', { id: media.id })
            .execute();

          if (updateResult.affected) {
            softDeletedMedia.push({ id: media.id, publicId: media.publicId });
          }
        }),
      );

      if (!softDeletedMedia.length) return;

      void this.cleanupSoftDeletedMedia(softDeletedMedia);
    } catch (error) {
      this.logger.error('Failed to cleanup expired draft media', error instanceof Error ? error.stack : String(error));
    }
  }

  private async cleanupSoftDeletedMedia(mediaList: Array<{ id: number; publicId: string }>) {
    if (!mediaList.length) return;

    try {
      const cleanupResults = await Promise.allSettled(
        mediaList.map(async (media) => {
          await this.cloudinaryService.destroy(media.publicId);

          await this.mediaRepository
            .createQueryBuilder()
            .delete()
            .from(Media)
            .where('id = :id', { id: media.id })
            .andWhere('isDeleted = :isDeleted', { isDeleted: true })
            .andWhere('NOT EXISTS (SELECT 1 FROM media_attachment ma WHERE ma.mediaId = :id)', { id: media.id })
            .execute();
        }),
      );

      cleanupResults.forEach((result, index) => {
        if (result.status === 'fulfilled') return;

        const media = mediaList[index];
        this.logger.warn(
          `Failed to clean up soft-deleted media id=${media.id}, publicId=${media.publicId}: ${result.reason instanceof Error ? result.reason.message : String(result.reason)}`,
        );
      });
    } catch (error) {
      this.logger.error(
        'Failed to hard-delete soft-deleted media',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  getDraftExpiryDate() {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    return expiresAt;
  }

  private async runExpiredDraftCleanup() {
    if (this.isCleanupRunning) return;

    this.isCleanupRunning = true;

    try {
      await this.cleanupExpiredDraftMedia();
    } finally {
      this.isCleanupRunning = false;
    }
  }
}
