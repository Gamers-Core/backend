import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { BadRequestException, NotFoundException } from 'src/common/exceptions';
import { Variant } from 'src/products/entities/variant.entity';
import { InventoryService } from 'src/products/services/inventory.service';

import { AddOrderItemDTO } from '../dtos/admin/add-order-item.dto';
import { UpdateOrderItemDTO } from '../dtos/admin/update-order.dto';
import { ItemSnapshot } from '../entities/item-snapshot.entity';
import { Order } from '../entities/order.entity';

@Injectable()
export class OrderItemsService {
  constructor(private readonly inventoryService: InventoryService) {}

  async add(order: Order, items: AddOrderItemDTO[], manager: EntityManager) {
    if (!items.length) throw BadRequestException('orders.itemsRequired');

    const itemSnapshotRepo = manager.getRepository(ItemSnapshot);
    const itemSnapshots: Array<Omit<ItemSnapshot, 'id'> & { order: Order }> = [];
    const reservedVariants: Array<{ variant: Variant; quantity: number }> = [];

    for (const { externalId, quantity } of items) {
      const variant = await this.inventoryService.reserveStock(externalId, quantity, manager);

      reservedVariants.push({ variant, quantity });
    }

    const productIds = [...new Set(reservedVariants.map(({ variant }) => variant.product.id))];
    const siblingCounts = productIds.length
      ? await manager
          .getRepository(Variant)
          .createQueryBuilder('variant')
          .select('variant.product_id', 'productId')
          .addSelect('COUNT(*)', 'count')
          .where('variant.product_id IN (:...productIds)', { productIds })
          .groupBy('variant.product_id')
          .getRawMany<{ productId: number; count: string }>()
      : [];

    const siblingsByProductId = new Map(
      siblingCounts.map(({ productId, count }) => [Number(productId), Number(count)]),
    );

    for (const { variant, quantity } of reservedVariants) {
      const siblingsCount = siblingsByProductId.get(variant.product.id) ?? 0;
      const hasSiblings = siblingsCount > 1;
      const snapshot = this.snapshot(variant, quantity, hasSiblings);

      itemSnapshots.push({ ...snapshot, order });
    }

    if (itemSnapshots.length) {
      const created = itemSnapshotRepo.create(itemSnapshots);
      await itemSnapshotRepo.save(created);
    }

    return itemSnapshots.reduce((sum, snapshot) => sum + snapshot.lineTotal, 0);
  }

  async update(order: Order, itemId: number, itemDTO: UpdateOrderItemDTO, manager: EntityManager) {
    const item = this.getOneOrFail(order, itemId);

    if (itemDTO.quantity === item.quantity) return 0;

    const quantityDifference = itemDTO.quantity - item.quantity;

    if (quantityDifference > 0)
      await this.inventoryService.reserveStock(item.variantExternalId, quantityDifference, manager);
    else if (quantityDifference < 0)
      await this.inventoryService.restoreStock(item.variantExternalId, -quantityDifference, manager);

    item.quantity = itemDTO.quantity;
    item.lineTotal = item.quantity * item.unitPrice;

    await manager.getRepository(ItemSnapshot).save(item);

    return quantityDifference * item.unitPrice;
  }

  async remove(order: Order, itemId: number, manager: EntityManager) {
    if (order.items.length <= 1) throw BadRequestException('orders.mustContainAtLeastOneItem');

    const item = this.getOneOrFail(order, itemId);
    const totalDifference = -item.lineTotal;

    await this.inventoryService.restoreStock(item.variantExternalId, item.quantity, manager);
    await manager.getRepository(ItemSnapshot).delete(item.id);

    return totalDifference;
  }

  private snapshot(variant: Variant, quantity: number, hasSiblings: boolean): Omit<ItemSnapshot, 'id' | 'order'> {
    const unitPrice = variant.price;
    const lineTotal = unitPrice * quantity;

    return {
      productId: variant.product.id,
      variantExternalId: variant.externalId,
      productTitle: { ...variant.product.title },
      variantName: hasSiblings ? variant.name : null,
      mediaId: variant.image?.id ?? null,
      imageURL: variant.image?.src ?? null,
      quantity,
      unitPrice,
      lineTotal,
    };
  }

  private getOneOrFail(order: Order, itemId: number) {
    const item = order.items.find(({ id }) => id === itemId);
    if (!item) throw NotFoundException('orders.itemNotFound');

    return item;
  }
}
