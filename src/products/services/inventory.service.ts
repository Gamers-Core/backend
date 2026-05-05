import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';

import { BadRequestException, NotFoundException } from 'src/common/exceptions';
import { withOptionalManager } from 'src/common/with-optional-manager';

import { Variant } from '../entities/variant.entity';
import { variantWithProductBrandCategoryRelations } from '../relations';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Variant)
    private readonly variantRepository: Repository<Variant>,
  ) {}

  getManyByExternalIds(externalIds: string[], manager?: EntityManager) {
    return withOptionalManager(manager, this.variantRepository.manager, async (manager) => {
      const variantRepo = manager.getRepository(Variant);

      const uniqueIds = [...new Set(externalIds)];

      const variants = await variantRepo.find({
        where: { externalId: In(uniqueIds), isActive: true },
        relations: variantWithProductBrandCategoryRelations,
      });

      if (variants.length !== uniqueIds.length) {
        const foundIds = variants.map(({ externalId }) => externalId);
        const missingIds = uniqueIds.filter((id) => !foundIds.includes(id));

        throw NotFoundException(['products.variantsNotFound', { externalIds: missingIds.join(',') }]);
      }

      return variants;
    });
  }

  reserveStock(externalId: string, amount: number, manager?: EntityManager): Promise<Variant> {
    if (amount < 1) throw BadRequestException('products.requiredAmountMin');

    return withOptionalManager(manager, this.variantRepository.manager, async (transactionManager) => {
      const variantRepo = transactionManager.getRepository(Variant);

      const result = await variantRepo
        .createQueryBuilder()
        .update(Variant)
        .set({ stock: () => `stock - ${amount}` })
        .where('external_id = :externalId', { externalId })
        .andWhere('is_active = true')
        .andWhere('stock >= :amount', { amount })
        .execute();

      if (!result.affected) throw BadRequestException(['products.insufficientStock', { externalId }]);

      return this.getManyByExternalIds([externalId], transactionManager).then(([variant]) => variant);
    });
  }

  restoreStock(externalId: string, amount: number, manager?: EntityManager) {
    return withOptionalManager(manager, this.variantRepository.manager, async (manager) => {
      const variantRepo = manager.getRepository(Variant);

      await variantRepo.increment({ externalId }, 'stock', amount);
    });
  }
}
