import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOptionsWhere, In, Repository } from 'typeorm';

import { BadRequestException } from 'src/common/exceptions';
import { withOptionalManager } from 'src/common/with-optional-manager';

import { Media } from './entities/media.entity';
import { ProductMedia } from './entities/product-media.entity';
import { MediaService } from './media.service';

@Injectable()
export class ProductMediaService {
  constructor(
    private readonly mediaService: MediaService,
    @InjectRepository(ProductMedia)
    private readonly attachmentRepo: Repository<ProductMedia>,
  ) {}

  async sync(productId: number, mediaIds: number[], manager?: EntityManager) {
    return withOptionalManager(manager, this.attachmentRepo.manager, async (manager) => {
      if (!mediaIds.length) {
        await this.detachAll(productId, manager);
        return [];
      }

      const existing = await this.getAllOrdered(manager, { product: { id: productId } });
      const existingIds = existing.map((a) => a.media.id);

      const uniqueIds = [...new Set(mediaIds)];
      const existingSet = new Set(existingIds);
      const uniqueSet = new Set(uniqueIds);

      const maxOrder = existing.reduce((max, a) => Math.max(max, a.order), 0);
      const toAttach = uniqueIds.filter((id) => !existingSet.has(id));
      await this.attach(productId, toAttach, maxOrder, manager);

      const toDetach = existingIds.filter((id) => !uniqueSet.has(id));
      await this.detach(toDetach, manager);

      await this.reorder(productId, uniqueIds, manager);

      return this.getAllOrdered(manager, { product: { id: productId } });
    });
  }

  private async attach(productId: number, mediaIds: number[], maxOrder: number, manager: EntityManager) {
    if (!mediaIds.length) return;

    const mediaRepo = manager.getRepository(Media);
    const mediaNumber = await mediaRepo.countBy({ id: In(mediaIds) });
    if (mediaNumber !== mediaIds.length) throw BadRequestException('media.invalid');

    const attachmentRepo = manager.getRepository(ProductMedia);
    const attachments = mediaIds.map((mediaId, index) =>
      attachmentRepo.create({
        product: { id: productId },
        media: { id: mediaId },
        order: maxOrder + index + 1,
      }),
    );

    await attachmentRepo.save(attachments);
    await Promise.all(mediaIds.map((id) => this.mediaService.attach(id, manager)));
  }

  private async detachAll(productId: number, manager: EntityManager) {
    const attachments = await this.getAllOrdered(manager, { product: { id: productId } });
    if (!attachments.length) return;

    await this.detach(
      attachments.map(({ media }) => media.id),
      manager,
    );
  }

  private async detach(mediaIds: number[], manager: EntityManager) {
    if (!mediaIds.length) return;

    const repo = manager.getRepository(ProductMedia);

    await repo.delete({ media: { id: In(mediaIds) } });
    await Promise.all(mediaIds.map((id) => this.mediaService.detach(id, manager)));
  }

  private async reorder(productId: number, mediaIds: number[], manager: EntityManager) {
    const repo = manager.getRepository(ProductMedia);

    const all = await this.getAllOrdered(manager, { product: { id: productId } });
    const map = new Map(all.map((a) => [a.media.id, a]));

    const toSave = mediaIds.map((mediaId, index) => {
      const attachment = map.get(mediaId)!;

      attachment.order = index + 1;

      return attachment;
    });

    await repo.save(toSave);
  }

  private async getAllOrdered(manager: EntityManager, where: FindOptionsWhere<ProductMedia>) {
    const repo = manager.getRepository(ProductMedia);

    return repo.find({
      where,
      relations: { media: true },
      order: { order: 'ASC' },
    });
  }
}
