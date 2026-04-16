import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { ItemSnapshot, MediaAttachment, Order, Variant } from 'src/entity';
import { InventoryService } from 'src/products';
import { BadRequestException, NotFoundException } from 'src/common';
import { MediaAttachmentService } from 'src/media';

import { AddOrderItemDTO, UpdateOrderItemDTO } from './dtos';

@Injectable()
export class OrderItemsService {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly mediaAttachmentService: MediaAttachmentService,
  ) {}

  async addItems(order: Order, items: AddOrderItemDTO[], manager: EntityManager) {
    if (!items.length) throw new BadRequestException('orders.itemsRequired');

    const itemSnapshotRepo = manager.getRepository(ItemSnapshot);
    const itemSnapshots: Array<Omit<ItemSnapshot, 'id'> & { order: Order }> = [];
    const reservedVariants: Array<{ variant: Variant; quantity: number }> = [];

    for (const { externalId, quantity } of items) {
      const variant = await this.inventoryService.reserveStock(externalId, quantity, manager);

      reservedVariants.push({ variant, quantity });
    }

    const variantIds = reservedVariants.map(({ variant }) => variant.id);
    const variantMediaMap = await this.mediaAttachmentService.getBulkMedia(
      variantIds,
      'variant',
      manager.getRepository(MediaAttachment),
    );

    const productIds = reservedVariants.map(({ variant }) => variant.product.id);
    const productMediaMap = await this.mediaAttachmentService.getBulkMedia(
      productIds,
      'product',
      manager.getRepository(MediaAttachment),
    );

    for (const { variant, quantity } of reservedVariants) {
      const imageURL =
        variantMediaMap[variant.id]?.[0]?.media.url ?? productMediaMap[variant.product.id]?.[0]?.media.url ?? null;
      const snapshot = this.snapshot(variant, quantity, imageURL);

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
      await this.inventoryService.reserveStock(item.variantExternalId, quantityDifference, manager);
    else if (quantityDifference < 0)
      await this.inventoryService.restoreStock(item.variantExternalId, -quantityDifference, manager);

    item.quantity = itemDTO.quantity;
    item.lineTotal = item.quantity * item.unitPrice;

    await manager.getRepository(ItemSnapshot).save(item);

    return quantityDifference * item.unitPrice;
  }

  async deleteItem(order: Order, itemId: number, manager: EntityManager) {
    if (order.items.length <= 1) throw new BadRequestException('orders.mustContainAtLeastOneItem');

    const item = this.getItemOrFail(order, itemId);
    const totalDifference = -item.lineTotal;

    await this.inventoryService.restoreStock(item.variantExternalId, item.quantity, manager);
    await manager.getRepository(ItemSnapshot).delete(item.id);

    return totalDifference;
  }

  private snapshot(variant: Variant, quantity: number, imageURL: string | null): Omit<ItemSnapshot, 'id' | 'order'> {
    const unitPrice = variant.price;
    const lineTotal = unitPrice * quantity;

    return {
      productId: variant.product.id,
      variantExternalId: variant.externalId,
      productTitle: { ...variant.product.title },
      variantName: { ...(variant.name ?? variant.product.title) },
      imageURL,
      quantity,
      unitPrice,
      lineTotal,
    };
  }

  private getItemOrFail(order: Order, itemId: number) {
    const item = order.items.find(({ id }) => id === itemId);
    if (!item) throw new NotFoundException('orders.itemNotFound');

    return item;
  }
}
