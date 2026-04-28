import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { BadRequestException, NotFoundException } from 'src/common/exceptions';
import { withOptionalManager } from 'src/common/with-optional-manager';

import { Variant } from '../entities/variant.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Variant)
    private readonly variantRepository: Repository<Variant>,
  ) {}

  async findByExternalId(
    externalId: string,
    manager: EntityManager = this.variantRepository.manager,
  ): Promise<Variant> {
    const variantRepo = manager.getRepository(Variant);
    const variant = await variantRepo.findOne({
      where: { externalId, isActive: true },
      relations: ['product'],
    });

    if (!variant) throw new NotFoundException('products.variantNotFound');

    return variant;
  }

  async reserveStock(externalId: string, amount: number, manager?: EntityManager): Promise<Variant> {
    if (amount < 1) throw new BadRequestException('products.requiredAmountMin');

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

      if (!result.affected) throw new BadRequestException(['products.insufficientStock', { externalId }]);

      return this.findByExternalId(externalId, transactionManager);
    });
  }

  async restoreStock(externalId: string, amount: number, manager: EntityManager = this.variantRepository.manager) {
    const variantRepo = manager.getRepository(Variant);

    await variantRepo.increment({ externalId }, 'stock', amount);
  }
}
