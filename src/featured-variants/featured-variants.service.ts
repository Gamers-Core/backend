import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, IsNull, Repository } from 'typeorm';

import { FeaturedVariant, MediaAttachment, Variant } from 'src/entity';
import { BadRequestException, ConflictException, NotFoundException, withOptionalManager } from 'src/common';
import { MediaAttachmentService } from 'src/media';
import { featuredVariantRelations } from 'src/products';

import { AddFeaturedVariantDTO, UpdateFeaturedVariantDTO } from './dtos';

@Injectable()
export class FeaturedVariantsService {
  constructor(
    @InjectRepository(FeaturedVariant)
    private readonly repo: Repository<FeaturedVariant>,
    @InjectRepository(Variant)
    private readonly variantRepo: Repository<Variant>,
    private readonly attachmentService: MediaAttachmentService,
  ) {}

  async getAll() {
    const featuredVariants = await this.repo.find({
      order: { position: 'ASC' },
      relations: featuredVariantRelations,
      where: { variant: { deletedAt: IsNull() } },
    });

    const variantIds = featuredVariants.map(({ variant }) => variant.id);
    const variantMedia = await this.attachmentService.getBulkMedia(variantIds, 'variant');

    const variantProductIds = featuredVariants.map(({ variant }) => variant.product.id);
    const variantProductMedia = await this.attachmentService.getBulkMedia(variantProductIds, 'product');

    return featuredVariants.map((featured) => ({
      ...featured,
      variant: {
        ...featured.variant,
        media: variantMedia[featured.variant.id] ?? [],
        product: { ...featured.variant.product, media: variantProductMedia[featured.variant.product.id] ?? [] },
      },
    }));
  }

  async add(dto: AddFeaturedVariantDTO) {
    return this.repo.manager.transaction(async (manager) => {
      const repo = manager.getRepository(FeaturedVariant);
      const variantRepo = manager.getRepository(Variant);

      const variant = await variantRepo.findOne({
        where: { id: dto.variantId, isActive: true, deletedAt: IsNull() },
      });
      if (!variant) throw new NotFoundException('products.variantNotFound');

      const existing = await repo.findOne({ where: { variant: { id: dto.variantId } } });
      if (existing) throw new ConflictException('featuredVariants.alreadyFeatured');

      const maxRaw = await repo
        .createQueryBuilder('featuredVariant')
        .select('MAX(featuredVariant.position)', 'max')
        .getRawOne<{ max: string | null }>();
      const maxPosition = Number(maxRaw?.max) || 0;

      const saved = await repo.save(
        repo.create({
          ...dto,
          variant: { id: dto.variantId },
          position: maxPosition + 1,
        }),
      );

      return this.findOneWithRelationsOrFail(saved.id, manager);
    });
  }

  async update(id: number, { variantId, ...dto }: UpdateFeaturedVariantDTO) {
    const featured = await this.repo.findOne({ where: { id } });
    if (!featured) throw new NotFoundException('featuredVariants.notFound');

    Object.assign(featured, dto);
    if (variantId) {
      const variant = await this.variantRepo.findOne({ where: { id: variantId, isActive: true, deletedAt: IsNull() } });
      if (!variant) throw new NotFoundException('products.variantNotFound');

      const existing = await this.repo.findOne({ where: { variant: { id: variantId } } });
      if (existing && existing.id !== id) throw new ConflictException('featuredVariants.alreadyFeatured');

      featured.variant = variant;
    }

    const saved = await this.repo.save(featured);

    return this.findOneWithRelationsOrFail(saved.id);
  }

  async remove(id: number) {
    const featured = await this.repo.findOne({ where: { id } });
    if (!featured) throw new NotFoundException('featuredVariants.notFound');

    await this.repo.remove(featured);

    return { deleted: true };
  }

  async reorder(orderedIds: number[]) {
    const featured = await this.repo.find({
      relations: featuredVariantRelations,
      where: { variant: { deletedAt: IsNull() } },
      order: { position: 'ASC' },
    });

    if (featured.length !== orderedIds.length) throw new BadRequestException('featuredVariants.invalidIds');

    const orderedIdsSet = new Set(orderedIds);
    if (orderedIdsSet.size !== orderedIds.length) throw new BadRequestException('featuredVariants.invalidIds');

    const featuredById = new Map(featured.map((item) => [item.id, item]));
    const hasUnknownId = orderedIds.some((id) => !featuredById.has(id));
    if (hasUnknownId) throw new BadRequestException('featuredVariants.invalidIds');

    await this.repo.save(
      orderedIds.map((id, index) => {
        const item = featuredById.get(id)!;
        item.position = index + 1;

        return item;
      }),
    );

    return { updated: true };
  }

  private async findOneWithRelationsOrFail(id: number, manager?: EntityManager) {
    return withOptionalManager(manager, this.repo.manager, async (manager) => {
      const repo = manager.getRepository(FeaturedVariant);
      const attachmentRepo = manager.getRepository(MediaAttachment);

      const featured = await repo.findOne({
        where: { id, variant: { deletedAt: IsNull() } },
        relations: featuredVariantRelations,
      });

      if (!featured) throw new NotFoundException('featuredVariants.notFound');

      const media = await this.attachmentService.getMedia(
        { entityId: featured.variant.id, entityType: 'variant' },
        attachmentRepo,
      );
      const productMedia = await this.attachmentService.getMedia(
        { entityId: featured.variant.product.id, entityType: 'product' },
        attachmentRepo,
      );

      return {
        ...featured,
        variant: { ...featured.variant, media, product: { ...featured.variant.product, media: productMedia } },
      };
    });
  }
}
