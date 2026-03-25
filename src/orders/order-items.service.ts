import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { ItemSnapshot, Order, ProductVariantEntity } from 'src/entity';
import { VariantsService } from 'src/products';

import { AddOrderItemDTO, UpdateOrderItemDTO } from './dtos';

@Injectable()
export class OrderItemsService {
  constructor(private readonly variantsService: VariantsService) {}

  async addItems(order: Order, items: AddOrderItemDTO[], manager: EntityManager) {
    if (!items.length) throw new BadRequestException('Items are required');

    const itemSnapshotRepo = manager.getRepository(ItemSnapshot);
    const itemSnapshots: Array<Omit<ItemSnapshot, 'id'> & { order: Order }> = [];

    for (const { externalId, quantity } of items) {
      const variant = await this.variantsService.reserveStock(externalId, quantity, manager);
      const snapshot = this.snapshot(variant, quantity);

      itemSnapshots.push({ ...snapshot, order });
    }

    if (itemSnapshots.length) {
      const created = itemSnapshotRepo.create(itemSnapshots);
      await itemSnapshotRepo.save(created);
    }

    return itemSnapshots.reduce((sum, snapshot) => sum + snapshot.lineTotal, 0);
  }

  async updateItem(order: Order, itemId: number, itemDTO: UpdateOrderItemDTO, manager: EntityManager) {
    const item = this.getItemOrFail(order, itemId);

    if (itemDTO.quantity === item.quantity) return 0;

    const quantityDifference = itemDTO.quantity - item.quantity;

    if (quantityDifference > 0)
      await this.variantsService.reserveStock(item.variantExternalId, quantityDifference, manager);
    else if (quantityDifference < 0)
      await this.variantsService.syncStock(item.variantExternalId, -quantityDifference, manager);

    item.quantity = itemDTO.quantity;
    item.lineTotal = item.quantity * item.unitPrice;

    await manager.getRepository(ItemSnapshot).save(item);

    return quantityDifference * item.unitPrice;
  }

  async deleteItem(order: Order, itemId: number, manager: EntityManager) {
    if (order.items.length <= 1) throw new BadRequestException('Order must contain at least one item');

    const item = this.getItemOrFail(order, itemId);
    const totalDifference = -item.lineTotal;

    await this.variantsService.syncStock(item.variantExternalId, item.quantity, manager);
    await manager.getRepository(ItemSnapshot).delete(item.id);

    return totalDifference;
  }

  private snapshot(variant: ProductVariantEntity, quantity: number): Omit<ItemSnapshot, 'id' | 'order'> {
    const unitPrice = variant.price;
    const lineTotal = unitPrice * quantity;

    return {
      productId: variant.product.id,
      productTitle: variant.product.title,
      variantExternalId: variant.externalId,
      variantName: variant.name ?? variant.product.title,
      quantity,
      unitPrice,
      lineTotal,
    };
  }

  private getItemOrFail(order: Order, itemId: number) {
    const item = order.items.find(({ id }) => id === itemId);
    if (!item) throw new NotFoundException('Order item not found');

    return item;
  }
}
