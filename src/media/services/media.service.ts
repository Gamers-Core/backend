import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { NotFoundException } from 'src/common/exceptions';
import { withOptionalManager } from 'src/common/with-optional-manager';

import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UploadMediaDTO } from '../dtos/admin/upload-media.dto';
import { Media } from '../entities/media.entity';
import { getBlurDataURL, mapToMedia } from '../helpers';
import { UploadedMediaFile } from '../types';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    private readonly cloudinaryService: CloudinaryService,
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
  ) {}

  async upload(file: UploadedMediaFile, mediaDTO: UploadMediaDTO) {
    const result = await this.cloudinaryService.uploadBuffer(file, mediaDTO.folder);

    const media = mapToMedia(result);
    const blurDataURL = await getBlurDataURL(file, media);

    return await this.mediaRepository.save(
      this.mediaRepository.create({ ...media, blurDataURL, expiresAt: this.getDraftExpiryDate() }),
    );
  }

  remove(id: number) {
    return this.mediaRepository.manager.transaction(async (manager) => {
      const media = await this.getOneOrFail(id, manager);

      try {
        await this.cloudinaryService.destroy(media.publicId, media.type);
      } catch (error) {
        this.logger.error(
          `Failed to delete media ${media.publicId} from Cloudinary: ${error instanceof Error ? error.message : String(error)}`,
          error instanceof Error ? error.stack : String(error),
        );

        throw error;
      }

      await this.mediaRepository.delete(id);
    });
  }

  attach(mediaId: number, manager?: EntityManager): Promise<Media> {
    return withOptionalManager(manager, this.mediaRepository.manager, async (manager) => {
      const repo = manager.getRepository(Media);

      const media = await this.getOneOrFail(mediaId, manager);

      await repo.update({ id: media.id }, { expiresAt: null });

      return media;
    });
  }

  detach(mediaId: number, manager?: EntityManager): Promise<void> {
    return withOptionalManager(manager, this.mediaRepository.manager, async (manager) => {
      const repo = manager.getRepository(Media);

      const result = await repo.update({ id: mediaId }, { expiresAt: this.getDraftExpiryDate() });
      if (result.affected) return;

      throw NotFoundException('media.notFound');
    });
  }

  swapImage(newMediaId: number, oldMediaId: number | undefined, manager?: EntityManager): Promise<Media> {
    return withOptionalManager(manager, this.mediaRepository.manager, async (manager) => {
      const newMedia = await this.attach(newMediaId, manager);

      if (oldMediaId && oldMediaId !== newMediaId) await this.detach(oldMediaId, manager);

      return newMedia;
    });
  }

  private getOneOrFail(id: number, manager?: EntityManager) {
    return withOptionalManager(manager, this.mediaRepository.manager, async (manager) => {
      const repo = manager.getRepository(Media);

      const media = await repo.findOneBy({ id });
      if (!media) throw NotFoundException('media.notFound');

      return media;
    });
  }

  private getDraftExpiryDate() {
    const expiresAt = new Date();

    expiresAt.setHours(expiresAt.getHours() + 24);

    return expiresAt;
  }

  @Cron(CronExpression.EVERY_HOUR, { waitForCompletion: true })
  async cleanupExpiredDraftMedia() {
    const now = new Date();

    try {
      const { raw: softDeleted } = await this.mediaRepository
        .createQueryBuilder()
        .update(Media)
        .set({ isDeleted: true })
        .where('expires_at IS NOT NULL')
        .andWhere('expires_at < :now', { now })
        .andWhere('is_deleted = false')
        .andWhere(this.notReferencedCondition('id'))
        .returning(['id', 'publicId', 'type'])
        .execute();

      if (!softDeleted.length) return;

      await this.cleanupSoftDeletedMedia(softDeleted);
    } catch (error) {
      this.logger.error('Failed to cleanup expired draft media', error instanceof Error ? error.stack : String(error));
    }
  }

  private async cleanupSoftDeletedMedia(mediaList: Pick<Media, 'id' | 'publicId' | 'type'>[]) {
    if (!mediaList.length) return;

    const results = await Promise.allSettled(
      mediaList.map(async (media) => {
        await this.cloudinaryService.destroy(media.publicId, media.type);

        await this.mediaRepository
          .createQueryBuilder()
          .delete()
          .from(Media)
          .where('id = :id', { id: media.id })
          .andWhere('is_deleted = true')
          .andWhere(this.notReferencedCondition(':id'), { id: media.id })
          .execute();
      }),
    );

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') return;

      const media = mediaList[index];

      this.logger.warn(
        `Failed to clean up media id=${media.id}, publicId=${media.publicId}: ${result.reason instanceof Error ? result.reason.message : String(result.reason)}`,
      );
    });
  }

  private notReferencedCondition(idRef = 'm.id') {
    return `
      NOT EXISTS (SELECT 1 FROM product_media pm WHERE pm.media_id = ${idRef})
      AND NOT EXISTS (SELECT 1 FROM brand b WHERE b.image_id = ${idRef})
      AND NOT EXISTS (SELECT 1 FROM product_variant_entity v WHERE v.image_id = ${idRef})
      AND NOT EXISTS (SELECT 1 FROM user_review r WHERE r.image_id = ${idRef})
      AND NOT EXISTS (SELECT 1 FROM item_snapshot s WHERE s.media_id = ${idRef})
    `;
  }
}
