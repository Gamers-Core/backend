import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { BadRequestException, InternalServerErrorException } from 'src/common/exceptions';
import { isUniqueViolation } from 'src/common/helpers/db.helpers';
import { withOptionalManager } from 'src/common/with-optional-manager';
import { cartRelations } from 'src/products/relations';
import { InventoryService } from 'src/products/services/inventory.service';

import { SyncCartItemDTO } from './dtos/sync-cart-item.dto';
import { CartItem } from './entities/cart-item.entity';
import { Cart } from './entities/cart.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private readonly cartRepo: Repository<Cart>,
    private readonly inventoryService: InventoryService,
  ) {}

  getCart(userId: number) {
    return this.getOrCreateCart(userId);
  }

  sync(userId: number, items: SyncCartItemDTO[], manager?: EntityManager) {
    return withOptionalManager(manager, this.cartRepo.manager, async (manager) => {
      const cart = await this.getOrCreateCart(userId, manager);
      const cartItemRepo = manager.getRepository(CartItem);

      await cartItemRepo.delete({ cart: { id: cart.id } });

      const uniqueExternalIds = [...new Set(items.map((item) => item.externalId))];
      if (uniqueExternalIds.length !== items.length) throw BadRequestException('cart.duplicateExternalIds');

      const variants = await this.inventoryService.getManyByExternalIds(uniqueExternalIds, manager);

      items.forEach((item, i) => {
        if (item.quantity > variants[i].stock)
          throw BadRequestException(['cart.insufficientStock', { externalId: variants[i].externalId }]);
      });

      const cartItems = items.map((item, i) =>
        cartItemRepo.create({ cart: { id: cart.id }, variant: variants[i], quantity: item.quantity }),
      );

      await cartItemRepo.save(cartItems);

      return this.getOrCreateCart(userId, manager);
    });
  }

  getOrCreateCart(userId: number, manager?: EntityManager, attempt = 0): Promise<Cart> {
    return withOptionalManager(manager, this.cartRepo.manager, async (manager) => {
      const cartRepo = manager.getRepository(Cart);

      const existing = await cartRepo.findOne({
        where: { user: { id: userId } },
        relations: cartRelations,
      });
      if (existing) return this.stripInactiveItems(existing, manager);

      return cartRepo.save(cartRepo.create({ user: { id: userId }, items: [] })).catch((error) => {
        if (!isUniqueViolation(error)) throw error;
        if (attempt >= 3) throw InternalServerErrorException('cart.createFailed');

        return this.getOrCreateCart(userId, manager, attempt + 1);
      });
    });
  }

  private async stripInactiveItems(cart: Cart, manager: EntityManager): Promise<Cart> {
    const inactiveItems = cart.items.filter((item) => !item.variant?.isActive);
    if (!inactiveItems.length) return cart;

    const cartItemRepo = manager.getRepository(CartItem);
    await cartItemRepo.delete(inactiveItems.map(({ id }) => id));

    cart.items = cart.items.filter(({ variant }) => variant?.isActive);

    return cart;
  }
}
