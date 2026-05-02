import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { BadRequestException, NotFoundException } from 'src/common/exceptions';
import { withOptionalManager } from 'src/common/with-optional-manager';
import { MediaService } from 'src/media/media.service';

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

  async add(productId: number, dtos: CreateVariantDTO[], manager?: EntityManager) {
    return withOptionalManager(manager, this.variantRepository.manager, async (manager) => {
      const variantRepo = manager.getRepository(Variant);
      const normalized = this.normalize(dtos);

      const variants = await Promise.all(
        normalized.map(async ({ imageId, ...dto }) =>
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

  async update(productId: number, variantId: number, { imageId, ...dto }: UpdateVariantDTO) {
    return this.variantRepository.manager.transaction(async (manager) => {
      const variantRepository = manager.getRepository(Variant);

      const variant = await this.findVariantOrFail(productId, variantId, manager);
      const remainingVariants = variant.product.variants.filter(({ id }) => id !== variantId);

      if (variant.compareAt && variant.compareAt <= variant.price)
        throw new BadRequestException('products.compareAtMustBeGreaterThanPrice');

      Object.assign(variant, dto);

      if (imageId) variant.image = await this.mediaService.swapImage(imageId, variant.image?.id, manager);
      else if (variant.image) await this.mediaService.detach(variant.image.id, manager);

      const normalized = this.normalize([variant, ...remainingVariants]);
      const savedVariants = await variantRepository.save(normalized);

      return savedVariants.find(({ id }) => id === variantId)!;
    });
  }

  async remove(productId: number, variantId: number) {
    return this.variantRepository.manager.transaction(async (manager) => {
      const variantRepository = manager.getRepository(Variant);

      const variant = await this.findVariantOrFail(productId, variantId, manager);
      const remainingVariants = variant.product.variants.filter(({ id }) => id !== variantId);
      if (!remainingVariants.length) throw new BadRequestException('products.cannotRemoveLastVariant');

      if (variant.image) await this.mediaService.detach(variant.image.id, manager);

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
      relations: variantWithProductFullRelations,
    });
    if (!variant) throw new NotFoundException('products.variantNotFound');

    return variant;
  }

  private normalize<T extends CreateVariantDTO | Variant>(variants: T[]): T[] {
    if (variants.length === 1) return [{ ...variants[0], isActive: true }];

    return variants;
  }
}
