import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, IsNull, Repository } from 'typeorm';

import { BadRequestException } from 'src/common/exceptions';
import { withOptionalManager } from 'src/common/with-optional-manager';
import { MediaService } from 'src/media/services/media.service';

import { SyncVariantDTO } from '../dtos/admin/sync-variant.dto';
import { Variant } from '../entities/variant.entity';

@Injectable()
export class VariantsService {
  constructor(
    @InjectRepository(Variant)
    private readonly variantRepository: Repository<Variant>,
    private readonly mediaService: MediaService,
  ) {}

  sync(productId: number, dtos: SyncVariantDTO[], manager?: EntityManager) {
    return withOptionalManager(manager, this.variantRepository.manager, async (manager) => {
      if (!dtos.length) throw BadRequestException('products.cannotRemoveLastVariant');

      const repo = manager.getRepository(Variant);
      const existing = await this.getActiveVariants(productId, manager);
      const existingById = new Map(existing.map((v) => [v.id, v]));

      const requestedIds = dtos.map(({ id }) => id).filter((id): id is number => !!id);
      const uniqueIds = new Set(requestedIds);

      if (requestedIds.length !== uniqueIds.size) throw BadRequestException('products.invalidVariantIds');
      if (requestedIds.some((id) => !existingById.has(id))) throw BadRequestException('products.invalidVariantIds');

      const toRemove = existing.filter(({ id }) => !uniqueIds.has(id));
      if (toRemove.length) {
        await Promise.all(
          toRemove.filter(({ image }) => image).map(({ image }) => this.mediaService.detach(image!.id, manager)),
        );
        await repo.softRemove(toRemove);
      }

      const prepared: Variant[] = [];
      for (let index = 0; index < dtos.length; index += 1) {
        const { id, imageId, ...dto } = dtos[index];
        const position = index + 1;

        if (id) {
          const variant = existingById.get(id)!;
          Object.assign(variant, dto, { position });

          if (imageId !== undefined)
            variant.image = await this.mediaService.swapImage(imageId, variant.image?.id, manager);

          if (variant.compareAt && variant.compareAt <= variant.price)
            throw BadRequestException('products.compareAtMustBeGreaterThanPrice');

          prepared.push(variant);
        } else {
          const variant = repo.create({
            ...dto,
            position,
            product: { id: productId },
            image: await this.mediaService.attach(imageId, manager),
          });

          if (variant.compareAt && variant.compareAt <= variant.price)
            throw BadRequestException('products.compareAtMustBeGreaterThanPrice');

          prepared.push(variant);
        }
      }

      const normalized = this.normalize(prepared);
      this.assertValidity(normalized);

      return repo.save(normalized);
    });
  }

  private normalize<T extends SyncVariantDTO | Variant>(variants: T[]): T[] {
    if (variants.length === 1) variants[0].isActive = true;

    return variants;
  }

  private assertValidity(variants: Variant[]) {
    if (!variants.some(({ isActive }) => isActive)) throw BadRequestException('products.activeVariantRequired');

    if (variants.some(({ compareAt, price }) => !!compareAt && compareAt <= price))
      throw BadRequestException('products.compareAtMustBeGreaterThanPrice');
  }

  private getActiveVariants(productId: number, manager: EntityManager): Promise<Variant[]> {
    const repo = manager.getRepository(Variant);

    return repo.find({
      where: { product: { id: productId }, deletedAt: IsNull() },
      relations: { image: true },
      order: { position: 'ASC' },
    });
  }
}
