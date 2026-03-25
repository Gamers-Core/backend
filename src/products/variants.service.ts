import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { Product, ProductVariantEntity } from 'src/entity';
import { MediaAttachmentService } from 'src/media';

import { ProductVariantDTO } from './dtos';

type SyncedPair = { dto: ProductVariantDTO; variant: ProductVariantEntity };

@Injectable()
export class VariantsService {
  constructor(
    private readonly mediaAttachmentService: MediaAttachmentService,
    @InjectRepository(ProductVariantEntity)
    private readonly variantRepository: Repository<ProductVariantEntity>,
  ) {}

  async getVariant(externalId: string, isActive: boolean = true, manager?: EntityManager) {
    manager = manager || this.variantRepository.manager;
    const variantRepo = manager.getRepository(ProductVariantEntity);

    const variant = await variantRepo.findOne({ where: { externalId, isActive }, relations: ['product'] });

    if (!variant) throw new NotFoundException('Variant not found');

    return variant;
  }

  async sync(product: Product, variantDTOs: ProductVariantDTO[], manager?: EntityManager) {
    if (!variantDTOs) return product;

    const normalizedVariantDTOs = this.normalizeVariantDTOs(variantDTOs);
    this.assertVariantValidity(normalizedVariantDTOs);

    manager = manager || this.variantRepository.manager;
    const variantsRepository = manager.getRepository(ProductVariantEntity);

    const existingVariants = await variantsRepository.find({
      where: { product: { id: product.id } },
    });
    const existingByExternalId = this.createExternalIdMap(existingVariants);

    const syncedPairs = await this.upsert(product, normalizedVariantDTOs, existingByExternalId, variantsRepository);

    const keptIds = new Set(syncedPairs.map(({ variant }) => variant.id));
    const toDelete = existingVariants.filter(({ id }) => !keptIds.has(id));
    await this.delete(toDelete, variantsRepository);

    await this.syncVariantMediaByPairs(syncedPairs, manager);

    product.variants = syncedPairs.map(({ variant }) => variant);
    return product;
  }

  async syncStock(externalId: string, usedAmount: number, manager?: EntityManager) {
    manager = manager || this.variantRepository.manager;
    const variantRepo = manager.getRepository(ProductVariantEntity);

    if (usedAmount > 0) await variantRepo.decrement({ externalId }, 'stock', usedAmount);
    if (usedAmount < 0) await variantRepo.increment({ externalId }, 'stock', -usedAmount);

    return this.getVariant(externalId, true, manager);
  }

  async reserveStock(externalId: string, requiredAmount: number, manager?: EntityManager) {
    manager = manager || this.variantRepository.manager;
    const variantRepo = manager.getRepository(ProductVariantEntity);

    if (requiredAmount < 1) throw new BadRequestException('requiredAmount must be at least 1');

    const result = await variantRepo
      .createQueryBuilder()
      .update(ProductVariantEntity)
      .set({ stock: () => `stock - ${requiredAmount}` })
      .where('externalId = :externalId', { externalId })
      .andWhere('isActive = :isActive', { isActive: true })
      .andWhere('stock >= :requiredAmount', { requiredAmount })
      .execute();

    if (!result.affected) throw new BadRequestException(`Insufficient stock for variant ${externalId}`);

    return this.getVariant(externalId, true, manager);
  }

  private async upsert(
    product: Product,
    variantDTOs: ProductVariantDTO[],
    variantsByExternalId: Map<string, ProductVariantEntity>,
    repo: Repository<ProductVariantEntity>,
  ): Promise<SyncedPair[]> {
    if (!variantDTOs.length) return [];

    const syncedPairs = variantDTOs.map((dto) => {
      const existing = dto.externalId ? variantsByExternalId.get(dto.externalId) : undefined;

      if (dto.externalId && !existing) throw new BadRequestException(`Invalid variant externalId: ${dto.externalId}`);

      const variant = this.mapEntity(product, dto, existing);
      return { dto, variant };
    });

    await repo.save(syncedPairs.map(({ variant }) => variant));

    return syncedPairs;
  }

  private async delete(variants: ProductVariantEntity[], variantRepository: Repository<ProductVariantEntity>) {
    if (!variants.length) return;

    await variantRepository.softRemove(variants);
  }

  private async syncVariantMediaByPairs(pairs: SyncedPair[], manager?: EntityManager) {
    const mediaAttachmentTasks = pairs.reduce<Promise<unknown>[]>((attachments, { dto, variant }) => {
      if (typeof dto.mediaIds !== 'undefined')
        attachments.push(
          this.mediaAttachmentService.sync(
            {
              mediaIds: dto.mediaIds,
              entityId: variant.id,
              entityType: 'variant',
            },
            manager,
          ),
        );

      return attachments;
    }, []);

    await Promise.all(mediaAttachmentTasks);
  }

  private normalizeVariantDTOs(variantDTOs: ProductVariantDTO[]) {
    const normalized = variantDTOs.map((variantDTO) => ({
      ...variantDTO,
      isActive: variantDTO.isActive ?? true,
      isDefault: variantDTO.isDefault ?? false,
    }));

    if (normalized.length === 1) {
      normalized[0].isActive = true;
      normalized[0].isDefault = true;
    }

    return normalized;
  }
  private createExternalIdMap(variants: ProductVariantEntity[] = []) {
    return new Map(variants.map((variant) => [variant.externalId, variant]));
  }

  private mapEntity(
    product: Product,
    dto: ProductVariantDTO,
    variant: ProductVariantEntity = new ProductVariantEntity(),
  ): ProductVariantEntity {
    variant.name = dto.name ?? null;
    variant.isDefault = dto.isDefault ?? false;
    variant.isActive = dto.isActive ?? true;
    variant.stock = dto.stock ?? 0;
    variant.price = dto.price;
    variant.costPerItem = dto.costPerItem;
    variant.compareAt = dto.compareAt ?? null;
    variant.product = product;

    return variant;
  }

  private assertVariantValidity(variantDTOs: ProductVariantDTO[]) {
    if (!variantDTOs?.length) return;

    if (variantDTOs.length > 1) {
      const hasUnnamedVariant = variantDTOs.some(({ name }) => typeof name !== 'string' || name.trim().length === 0);

      if (hasUnnamedVariant)
        throw new BadRequestException('Variant name is required when a product has multiple variants');
    }

    for (const variantDTO of variantDTOs) {
      if (typeof variantDTO.compareAt === 'number' && variantDTO.compareAt <= variantDTO.price)
        throw new BadRequestException('compareAt must be greater than price');
    }

    const externalIdSet = new Set<string>();
    for (const variantDTO of variantDTOs) {
      if (!variantDTO.externalId) continue;

      if (externalIdSet.has(variantDTO.externalId))
        throw new BadRequestException(`Duplicate variant externalId detected: ${variantDTO.externalId}`);

      externalIdSet.add(variantDTO.externalId);
    }

    const defaultCount = variantDTOs.filter((variant) => variant.isDefault).length;
    if (defaultCount > 1) throw new BadRequestException('Only one default variant allowed');

    if (variantDTOs.length > 0 && defaultCount === 0)
      throw new BadRequestException('At least one default variant is required');

    const activeCount = variantDTOs.filter(({ isActive }) => isActive).length;
    if (activeCount === 0) throw new BadRequestException('At least one active variant is required');
  }
}
