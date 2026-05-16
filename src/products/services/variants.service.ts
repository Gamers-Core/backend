import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, IsNull, Repository } from 'typeorm';

import { BadRequestException, NotFoundException } from 'src/common/exceptions';
import { withOptionalManager } from 'src/common/with-optional-manager';
import { MediaService } from 'src/media/services/media.service';

import { CreateVariantDTO } from '../dtos/admin/create-variant.dto';
import { UpdateVariantDTO } from '../dtos/admin/update-variant.dto';
import { Variant } from '../entities/variant.entity';
import { variantWithProductFullRelations } from '../relations';

@Injectable()
export class VariantsService {
  constructor(
    @InjectRepository(Variant)
    private readonly variantRepository: Repository<Variant>,
    private readonly mediaService: MediaService,
  ) {}

  add(productId: number, dtos: CreateVariantDTO[], manager?: EntityManager) {
    return withOptionalManager(manager, this.variantRepository.manager, async (manager) => {
      const variantRepo = manager.getRepository(Variant);
      const normalized = this.normalize(dtos);
      const existing = await this.getActiveVariants(productId, manager);
      const prepared = this.applyCreatePositions(normalized, existing);

      const variants = await Promise.all(
        prepared.map(async ({ imageId, ...dto }) =>
          variantRepo.create({
            ...dto,
            product: { id: productId },
            image: await this.mediaService.attach(imageId, manager),
          }),
        ),
      );

      return variantRepo.save(variants);
    });
  }

  update(productId: number, variantId: number, { imageId, ...dto }: UpdateVariantDTO) {
    return this.variantRepository.manager.transaction(async (manager) => {
      const variantRepository = manager.getRepository(Variant);

      const variant = await this.getOneOrFail(productId, variantId, manager);
      const remainingVariants = variant.product.variants.filter(({ id }) => id !== variantId);

      if (variant.compareAt && variant.compareAt <= variant.price)
        throw BadRequestException('products.compareAtMustBeGreaterThanPrice');

      Object.assign(variant, dto);

      if (imageId) variant.image = await this.mediaService.swapImage(imageId, variant.image?.id, manager);
      else if (variant.image) await this.mediaService.detach(variant.image.id, manager);

      const normalized = this.normalize([variant, ...remainingVariants]);
      const savedVariants = await variantRepository.save(normalized);

      return savedVariants.find(({ id }) => id === variantId)!;
    });
  }

  remove(productId: number, variantId: number) {
    return this.variantRepository.manager.transaction(async (manager) => {
      const variantRepository = manager.getRepository(Variant);

      const variant = await this.getOneOrFail(productId, variantId, manager);
      const remainingVariants = variant.product.variants.filter(({ id }) => id !== variantId);
      if (!remainingVariants.length) throw BadRequestException('products.cannotRemoveLastVariant');

      if (variant.image) await this.mediaService.detach(variant.image.id, manager);

      await variantRepository.softRemove(variant);

      const normalized = this.normalize(remainingVariants);
      await variantRepository.save(normalized);

      return { deleted: true };
    });
  }

  reorder(productId: number, ids: number[]) {
    return this.variantRepository.manager.transaction(async (manager) => {
      const variants = await this.getActiveVariants(productId, manager);

      const uniqueIds = new Set(ids);
      if (variants.length !== uniqueIds.size) throw BadRequestException('products.invalidVariantIds');

      const variantById = new Map(variants.map((variant) => [variant.id, variant]));
      if (ids.some((id) => !variantById.has(id))) throw BadRequestException('products.invalidVariantIds');

      const ordered = ids.map((id) => variantById.get(id)!);
      await this.reorderInternal(ordered, manager);

      return ordered;
    });
  }

  private async getOneOrFail(productId: number, variantId: number, manager: EntityManager) {
    const variantRepository = manager.getRepository(Variant);

    const variant = await variantRepository.findOne({
      where: { id: variantId, product: { id: productId } },
      relations: variantWithProductFullRelations,
    });
    if (!variant) throw NotFoundException('products.variantNotFound');

    return variant;
  }

  private normalize<T extends CreateVariantDTO | Variant>(variants: T[]): T[] {
    if (variants.length === 1) return [{ ...variants[0], isActive: true }];

    return variants;
  }

  private applyCreatePositions(dtos: CreateVariantDTO[], existing: Variant[]): CreateVariantDTO[] {
    const maxPosition = existing.reduce((max, variant) => Math.max(max, variant.position ?? 0), 0);

    return dtos.map((dto, index) => ({
      ...dto,
      position: dto.position ?? maxPosition + index + 1,
    }));
  }

  private async reorderInternal(variants: Variant[], manager: EntityManager): Promise<void> {
    if (!variants.length) return;

    const repo = manager.getRepository(Variant);
    await repo.save(variants.map((variant, i) => ({ ...variant, position: -(i + 1) })));
    await repo.save(variants.map((variant, i) => ({ ...variant, position: i + 1 })));
  }

  private getActiveVariants(productId: number, manager: EntityManager): Promise<Variant[]> {
    const repo = manager.getRepository(Variant);

    return repo.find({
      where: { product: { id: productId }, deletedAt: IsNull() },
      relations: { image: true },
    });
  }
}
