import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';

import { Media, MediaAttachment, MediaEntityType } from 'src/entity';
import { withOptionalManager, BadRequestException } from 'src/common';

import { MediaService } from './media.service';
import { MediaAttachmentOptionsDTO, EntityAttachmentDTO } from './dtos';

@Injectable()
export class MediaAttachmentService {
  constructor(
    private readonly mediaService: MediaService,
    @InjectRepository(Media)
    private readonly mediaRepo: Repository<Media>,

    @InjectRepository(MediaAttachment)
    private readonly attachmentRepo: Repository<MediaAttachment>,
  ) {}

  sync({ mediaIds, ...entity }: MediaAttachmentOptionsDTO, manager?: EntityManager) {
    return withOptionalManager(manager, this.attachmentRepo.manager, async (manager) => {
      const attachmentRepo = manager.getRepository(MediaAttachment);
      const mediaRepo = manager.getRepository(Media);

      if (!mediaIds.length) {
        await this.detachAll(entity, attachmentRepo, mediaRepo);
        return [];
      }

      const existingAttachments = await attachmentRepo.find({
        where: entity,
        relations: ['media'],
      });

      const existingIds = existingAttachments.reduce((ids, { media }) => (media ? [...ids, media.id] : ids), []);
      const uniqueIds = [...new Set(mediaIds)];

      const existingSet = new Set(existingIds);
      const toAttach = uniqueIds.filter((id) => !existingSet.has(id));
      await this.attach({ mediaIds: toAttach, ...entity }, attachmentRepo, mediaRepo);

      const uniqueSet = new Set(uniqueIds);
      const toDetach = existingIds.filter((id) => !uniqueSet.has(id));
      await this.detach({ mediaIds: toDetach, ...entity }, attachmentRepo, mediaRepo);

      await this.reorder({ mediaIds: uniqueIds, ...entity }, attachmentRepo);

      return this.getMedia(entity, attachmentRepo);
    });
  }

  private async attach(
    { mediaIds, entityId, entityType }: MediaAttachmentOptionsDTO,
    attachmentRepo = this.attachmentRepo,
    mediaRepo = this.mediaRepo,
  ) {
    if (!mediaIds.length) return;

    const uniqueIds = [...new Set(mediaIds)];

    await this.assertDraftMedia(uniqueIds, mediaRepo);

    const existing = await attachmentRepo.find({
      where: { entityId, entityType, media: { id: In(uniqueIds) } },
      relations: ['media'],
    });

    const existingIds = new Set(existing.map((a) => a.media.id));
    const newIds = uniqueIds.filter((id) => !existingIds.has(id));

    const currentAttachments = await attachmentRepo.find({ where: { entityId, entityType } });
    const maxOrder = currentAttachments.reduce((max, a) => Math.max(max, a.order), 0);

    const attachments = newIds.map((mediaId, index) => ({
      media: { id: mediaId },
      entityId,
      entityType,
      order: maxOrder + index + 1,
    }));

    await attachmentRepo.save(attachments);
    await mediaRepo.update({ id: In(newIds) }, { expiresAt: null });
  }

  private async detach(
    { mediaIds, entityId, entityType }: MediaAttachmentOptionsDTO,
    attachmentRepo = this.attachmentRepo,
    mediaRepo = this.mediaRepo,
  ) {
    if (!mediaIds.length) return;

    const uniqueIds = [...new Set(mediaIds)];

    const attachments = await attachmentRepo.find({
      where: { entityId, entityType, media: { id: In(uniqueIds) } },
      relations: ['media'],
    });

    if (!attachments.length) return;

    const mediaIdsToReset = attachments.map(({ media }) => media.id);

    await attachmentRepo.remove(attachments);
    await mediaRepo.update({ id: In(mediaIdsToReset) }, { expiresAt: this.mediaService.getDraftExpiryDate() });
  }

  private async detachAll(
    { entityId, entityType }: EntityAttachmentDTO,
    attachmentRepo = this.attachmentRepo,
    mediaRepo = this.mediaRepo,
  ) {
    const attachments = await attachmentRepo.find({
      where: { entityId, entityType },
      relations: ['media'],
    });

    if (!attachments.length) return;

    const mediaIdsToReset = attachments.map(({ media }) => media.id);

    await attachmentRepo.remove(attachments);
    await mediaRepo.update({ id: In(mediaIdsToReset) }, { expiresAt: this.mediaService.getDraftExpiryDate() });
  }

  private async reorder(
    { mediaIds, entityId, entityType }: MediaAttachmentOptionsDTO,
    repository = this.attachmentRepo,
  ) {
    if (!mediaIds.length) return;

    const attachments = await repository.find({
      where: { entityId, entityType },
      relations: ['media'],
    });

    const map = new Map(attachments.map((attachment) => [attachment.media.id, attachment]));

    const toSave = mediaIds.map((mediaId, index) => {
      const attachment = map.get(mediaId);
      if (!attachment) throw new BadRequestException('media.invalid');

      attachment.order = index + 1;
      return attachment;
    });

    await repository.save(toSave);
  }

  async assertDraftMedia(mediaIds: number[], repo: Repository<Media> = this.mediaRepo) {
    if (!mediaIds.length) return;

    const uniqueIds = [...new Set(mediaIds)];
    const media = await repo.findBy({ id: In(uniqueIds) });

    if (media.length !== uniqueIds.length) throw new BadRequestException('media.invalid');
  }

  async getMediaAttachments(where: EntityAttachmentDTO, attachmentRepo = this.attachmentRepo) {
    return attachmentRepo.find({
      where,
      relations: ['media'],
      order: { order: 'ASC' },
    });
  }

  async getMedia(where: EntityAttachmentDTO, attachmentRepo = this.attachmentRepo) {
    const attachments = await this.getMediaAttachments(where, attachmentRepo);

    const validAttachments = attachments.filter(({ media }) => Boolean(media));

    return validAttachments;
  }

  async getBulkMedia(entityIds: number[], entityType: MediaEntityType, attachmentRepo = this.attachmentRepo) {
    if (!entityIds.length) return {};

    const attachments = await attachmentRepo.find({
      where: { entityId: In(entityIds), entityType },
      relations: ['media'],
      order: { order: 'ASC' },
    });

    return attachments.reduce((acc, attachment) => {
      if (!attachment.media) return acc;

      const key = attachment.entityId;
      if (!acc[key]) acc[key] = [];

      acc[key].push(attachment);

      return acc;
    }, {});
  }
}
