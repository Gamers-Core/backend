import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, IsNull, Repository } from 'typeorm';

import { BadRequestException, ConflictException, NotFoundException } from 'src/common/exceptions';
import { withOptionalManager } from 'src/common/with-optional-manager';
import { Variant } from 'src/products/entities/variant.entity';
import { featuredVariantRelations } from 'src/products/relations';
import { CacheService } from 'src/redis/cache.service';

import { AddFeaturedVariantDTO } from './dtos/admin/add-featured-variant.dto';
import { UpdateFeaturedVariantDTO } from './dtos/admin/update-featured-variant.dto';
import { FeaturedVariant } from './entities/featured-variant.entity';

@Injectable()
export class FeaturedVariantsService {
  constructor(
    @InjectRepository(FeaturedVariant)
    private readonly repo: Repository<FeaturedVariant>,
    private readonly cacheService: CacheService,
  ) {}

  private readonly CACHE_KEY = 'featuredVariants:all';

  getAll() {
    return this.cacheService.getOrSet(this.CACHE_KEY, () => this.getAllOrdered(), { ttlMs: 1000 * 60 * 60 * 12 });
  }

  add({ variantId, ...dto }: AddFeaturedVariantDTO) {
    return this.repo.manager.transaction(async (manager) => {
      const repo = manager.getRepository(FeaturedVariant);

      const variant = await this.getActiveVariantOrFail(variantId, manager);
      const existing = await repo.findOne({ where: { variant: { id: variantId } } });
      if (existing) throw ConflictException('featuredVariants.alreadyFeatured');

      const maxRaw = await repo
        .createQueryBuilder('featuredVariant')
        .select('MAX(featuredVariant.position)', 'max')
        .getRawOne<{ max: string | null }>();
      const maxPosition = Number(maxRaw?.max) || 0;

      const saved = await repo.save(
        repo.create({
          ...dto,
          variant: { id: variant.id },
          position: maxPosition + 1,
        }),
      );

      await this.cacheService.delete(this.CACHE_KEY);

      return this.getOneOrFail(saved.id, manager);
    });
  }

  update(id: number, { variantId, ...dto }: UpdateFeaturedVariantDTO) {
    return this.repo.manager.transaction(async (manager) => {
      const repo = manager.getRepository(FeaturedVariant);

      const featured = await this.getOneOrFail(id, manager);

      Object.assign(featured, dto);

      if (variantId) {
        const variant = await this.getActiveVariantOrFail(variantId, manager);

        const existing = await this.repo.findOne({ where: { variant: { id: variant.id } } });
        if (existing && existing.id !== id) throw ConflictException('featuredVariants.alreadyFeatured');

        featured.variant = variant;
      }

      const saved = await repo.save(featured);

      await this.cacheService.delete(this.CACHE_KEY);

      return this.getOneOrFail(saved.id, manager);
    });
  }

  remove(id: number) {
    return this.repo.manager.transaction(async (manager) => {
      const repo = manager.getRepository(FeaturedVariant);

      const result = await repo.delete(id);
      if (!result.affected) throw NotFoundException('featuredVariants.notFound');

      const remaining = await this.getAllOrdered(manager);
      await this.reorderInternal(remaining, manager);

      await this.cacheService.delete(this.CACHE_KEY);

      return this.getAllOrdered(manager);
    });
  }

  reorder(ids: number[]) {
    return this.repo.manager.transaction(async (manager) => {
      const featured = await this.getAllOrdered(manager);

      const uniqueIds = new Set(ids);
      if (featured.length !== uniqueIds.size) throw BadRequestException('featuredVariants.invalidIds');

      const featuredById = new Map(featured.map((item) => [item.id, item]));
      const ordered = ids.map((id) => featuredById.get(id)!);

      await this.reorderInternal(ordered, manager);

      await this.cacheService.delete(this.CACHE_KEY);

      return this.getAllOrdered(manager);
    });
  }

  private async reorderInternal(featured: FeaturedVariant[], manager: EntityManager): Promise<void> {
    if (!featured.length) return;

    const repo = manager.getRepository(FeaturedVariant);

    await repo.save(featured.map((item, i) => ({ ...item, position: -(i + 1) })));
    await repo.save(featured.map((item, i) => ({ ...item, position: i + 1 })));
  }

  private getAllOrdered(manager?: EntityManager): Promise<FeaturedVariant[]> {
    return withOptionalManager(manager, this.repo.manager, async (manager) => {
      const repo = manager.getRepository(FeaturedVariant);

      return await repo.find({
        relations: featuredVariantRelations,
        where: { variant: { deletedAt: IsNull(), isActive: true } },
        order: { position: 'ASC' },
      });
    });
  }

  private getOneOrFail(id: number, manager?: EntityManager) {
    return withOptionalManager(manager, this.repo.manager, async (manager) => {
      const repo = manager.getRepository(FeaturedVariant);

      const featured = await repo.findOne({
        where: { id, variant: { deletedAt: IsNull(), isActive: true } },
        relations: featuredVariantRelations,
      });
      if (!featured) throw NotFoundException('featuredVariants.notFound');

      return featured;
    });
  }

  private async getActiveVariantOrFail(variantId: number, manager: EntityManager) {
    const variantRepo = manager.getRepository(Variant);

    const variant = await variantRepo.findOne({
      where: { id: variantId, isActive: true, deletedAt: IsNull() },
    });
    if (!variant) throw NotFoundException('products.variantNotFound');

    await this.cacheService.delete(this.CACHE_KEY);

    return variant;
  }
}
