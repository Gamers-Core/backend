import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { Product, Variant } from 'src/entity';
import { MediaAttachmentService } from 'src/media';
import { BadRequestException, NotFoundException, withOptionalManager } from 'src/common';

import { CreateVariantDTO, UpdateVariantDTO } from '../dtos/admin';

@Injectable()
export class VariantsService {
  constructor(
    @InjectRepository(Variant)
    private readonly variantRepository: Repository<Variant>,
    private readonly attachmentService: MediaAttachmentService,
  ) {}

  async add(productId: number, dtos: CreateVariantDTO[], manager?: EntityManager) {
    return withOptionalManager(manager, this.variantRepository.manager, async (manager) => {
      const variantRepo = manager.getRepository(Variant);
      const normalized = this.normalize(dtos);

      const product = await manager.getRepository(Product).findOne({ where: { id: productId } });
      if (!product) throw new NotFoundException('products.productNotFound');

      const pairs = normalized.map(({ mediaIds, ...dto }) => ({
        variant: variantRepo.create({ ...dto, product }),
        mediaIds,
      }));

      const saved = await variantRepo.save(pairs.map(({ variant }) => variant));
      const savedPairs = saved.map((variant, i) => ({ variant, mediaIds: pairs[i].mediaIds }));

      return Promise.all(
        savedPairs.map(async ({ variant, mediaIds }) => {
          const media = await this.attachmentService.sync(
            { entityId: variant.id, entityType: 'variant', mediaIds },
            manager,
          );

          return { ...variant, media };
        }),
      );
    });
  }

  async updateOne(productId: number, variantId: number, { mediaIds, ...dto }: UpdateVariantDTO) {
    return this.variantRepository.manager.transaction(async (manager) => {
      const variantRepository = manager.getRepository(Variant);

      const variant = await this.findVariantOrFail(productId, variantId, manager);
      const remainingVariants = variant.product.variants.filter(({ id }) => id !== variantId);

      Object.assign(variant, dto);

      if (variant.compareAt && variant.compareAt <= variant.price)
        throw new BadRequestException('products.compareAtMustBeGreaterThanPrice');

      const normalized = this.normalize([variant, ...remainingVariants]);
      const savedVariants = await variantRepository.save(normalized);

      if (mediaIds != null)
        await this.attachmentService.sync({ entityId: variantId, entityType: 'variant', mediaIds }, manager);

      return savedVariants.find(({ id }) => id === variantId)!;
    });
  }

  async removeOne(productId: number, variantId: number) {
    return this.variantRepository.manager.transaction(async (manager) => {
      const variantRepository = manager.getRepository(Variant);
      const variant = await this.findVariantOrFail(productId, variantId, manager);

      const remainingVariants = variant.product.variants.filter(({ id }) => id !== variantId);
      if (!remainingVariants.length) throw new BadRequestException('products.cannotRemoveLastVariant');

      await variantRepository.softRemove(variant);

      const normalized = this.normalize(remainingVariants);
      await variantRepository.save(normalized);

      return { deleted: true };
    });
  }

  private async findVariantOrFail(productId: number, variantId: number, manager: EntityManager) {
    const variantRepository = manager.getRepository(Variant);

    const variant = await variantRepository.findOne({
      where: { id: variantId, product: { id: productId } },
      relations: { product: { variants: true } },
    });
    if (!variant) throw new NotFoundException('products.variantNotFound');

    return variant;
  }

  private normalize<T extends CreateVariantDTO | Variant>(variants: T[]): T[] {
    if (variants.length === 1) return [{ ...variants[0], isActive: true }];

    return variants;
  }
}
