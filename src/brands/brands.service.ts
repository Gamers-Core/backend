import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { BadRequestException, NotFoundException } from 'src/common/exceptions';
import { MediaAttachment } from 'src/media/entities/media-attachment.entity';
import { MediaAttachmentService } from 'src/media/media-attachment.service';

import { AddBrandDTO } from './dtos/add-brand.dto';
import { UpdateBrandDTO } from './dtos/update-brand.dto';
import { Brand } from './entities/brand.entity';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private readonly repo: Repository<Brand>,
    private readonly attachmentService: MediaAttachmentService,
  ) {}

  async getAll() {
    const brands = await this.repo.find({ order: { id: 'ASC' } });

    const attachments = await this.attachmentService.getBulkMedia(
      brands.map(({ id }) => id),
      'brand',
      this.repo.manager.getRepository(MediaAttachment),
    );

    return brands.map((brand) => ({ ...brand, image: attachments[brand.id][0] || null }));
  }

  async getOne(id: number) {
    const brand = await this.repo.findOne({ where: { id } });
    if (!brand) throw new NotFoundException('products.brandNotFound');

    const attachments = await this.attachmentService.getBulkMedia(
      [brand.id],
      'brand',
      this.repo.manager.getRepository(MediaAttachment),
    );

    return { ...brand, image: attachments[brand.id][0] || null };
  }

  add({ imageId, ...dto }: AddBrandDTO) {
    return this.repo.manager.transaction(async (manager) => {
      const repo = manager.getRepository(Brand);

      const brand = await repo.save(repo.create(dto));

      await this.attachmentService.sync({ entityId: brand.id, entityType: 'brand', mediaIds: [imageId] }, manager);

      return this.findAllWithMedia(manager);
    });
  }

  async update(id: number, { imageId, ...dto }: UpdateBrandDTO) {
    return this.repo.manager.transaction(async (manager) => {
      const repo = manager.getRepository(Brand);

      const brand = await repo.findOne({ where: { id } });
      if (!brand) throw new NotFoundException('products.brandNotFound');

      Object.assign(brand, dto);
      await repo.save(brand);

      if (imageId)
        await this.attachmentService.sync({ entityId: brand.id, entityType: 'brand', mediaIds: [imageId] }, manager);

      return this.findOneWithProductsOrFail(id, repo);
    });
  }

  async delete(id: number) {
    const brand = await this.findOneWithProductsOrFail(id);

    if (brand.products.length) throw new BadRequestException('products.brandHasProducts');

    await this.repo.remove(brand);

    return { deleted: true };
  }

  async findOneWithProductsOrFail(id: number, repo = this.repo) {
    const brand = await repo.findOne({ where: { id }, relations: { products: true } });
    if (!brand) throw new NotFoundException('products.brandNotFound');

    const attachments = await this.attachmentService.getBulkMedia(
      [brand.id],
      'brand',
      repo.manager.getRepository(MediaAttachment),
    );

    return { ...brand, image: attachments[brand.id][0] || null };
  }

  private async findAllWithMedia(manager: EntityManager) {
    const repo = manager.getRepository(Brand);
    const attachmentsRepo = manager.getRepository(MediaAttachment);

    const brands = await repo.find({ order: { id: 'ASC' } });

    const attachments = await this.attachmentService.getBulkMedia(
      brands.map(({ id }) => id),
      'brand',
      attachmentsRepo,
    );

    return brands.map((brand) => ({ ...brand, image: attachments[brand.id][0] || null }));
  }
}
