import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { Cart, CartItem, ProductVariantEntity, User } from 'src/entity';
import { VariantsService } from 'src/products';

import { CreateCartItemDTO, UpdateCartItemDTO } from './dtos';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private readonly cartRepo: Repository<Cart>,
    private readonly variantService: VariantsService,
  ) {}

  async getCart(user: User, manager?: EntityManager) {
    manager = manager || this.cartRepo.manager;
    const cartRepo = manager.getRepository(Cart);

    const cart = await cartRepo.findOne({
      where: { id: user.cart.id, user: { id: user.id } },
      relations: { items: { variant: { product: true } } },
    });
    if (!cart) throw new NotFoundException('Cart not found');

    return cart;
  }

  async addItem(user: User, item: CreateCartItemDTO) {
    return this.cartRepo.manager.transaction(async (manager) => {
      const cartItemRepo = manager.getRepository(CartItem);
      const variant = await this.variantService.getVariant(item.variantExternalId, true, manager);

      const existingItem = await cartItemRepo.findOne({
        where: {
          cart: { id: user.cart.id },
          variant: { id: variant.id },
        },
      });

      const requestedQuantity = existingItem ? existingItem.quantity + item.quantity : item.quantity;
      this.assertVariantStock(variant, requestedQuantity);

      if (existingItem) {
        existingItem.quantity = requestedQuantity;
        await cartItemRepo.save(existingItem);
      } else {
        const cartItem = cartItemRepo.create({
          cart: { id: user.cart.id },
          variant,
          quantity: item.quantity,
        });

        await cartItemRepo.save(cartItem);
      }

      return this.getCart(user, manager);
    });
  }

  async updateItem(user: User, id: number, item: UpdateCartItemDTO) {
    return this.cartRepo.manager.transaction(async (manager) => {
      const cartItemRepo = manager.getRepository(CartItem);

      const cartItem = await cartItemRepo.findOne({
        where: { id, cart: { id: user.cart.id } },
        relations: { variant: { product: true } },
      });
      if (!cartItem) throw new NotFoundException('Cart item not found');

      this.assertVariantStock(cartItem.variant, item.quantity);

      if (item.quantity === 0) await cartItemRepo.delete({ id, cart: { id: user.cart.id } });
      else {
        cartItem.quantity = item.quantity;
        await cartItemRepo.save(cartItem);
      }

      return this.getCart(user, manager);
    });
  }

  async clearCart(user: User) {
    return this.cartRepo.manager.transaction(async (manager) => {
      const cartItemRepo = manager.getRepository(CartItem);

      await cartItemRepo.delete({ cart: { id: user.cart.id } });

      return this.getCart(user, manager);
    });
  }

  private assertVariantStock(variant: ProductVariantEntity, requestedQuantity: number) {
    if (requestedQuantity > variant.stock)
      throw new BadRequestException(`Insufficient stock for variant ${variant.externalId}`);
  }
}
