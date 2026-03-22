import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, QueryFailedError, Repository } from 'typeorm';

import { Cart, CartItem, ProductVariantEntity } from 'src/entity';
import { VariantsService } from 'src/products';

import { CreateCartItemDTO, UpdateCartItemDTO } from './dtos';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private readonly cartRepo: Repository<Cart>,
    private readonly variantService: VariantsService,
  ) {}

  async getCart(userId: number, manager?: EntityManager) {
    manager = manager || this.cartRepo.manager;
    const cartRepo = manager.getRepository(Cart);

    const cart = await cartRepo.findOne({
      where: { user: { id: userId } },
      relations: { items: { variant: { product: true } } },
    });
    if (!cart) {
      const newCart = cartRepo.create({ user: { id: userId }, items: [] });
      return await cartRepo.save(newCart);
    }

    return cart;
  }

  async addItem(userId: number, item: CreateCartItemDTO) {
    return this.cartRepo.manager.transaction(async (manager) => {
      const cartItemRepo = manager.getRepository(CartItem);
      const variant = await this.variantService.getVariant(item.variantExternalId, true, manager);

      const existingItem = await cartItemRepo.findOne({
        where: {
          cart: { user: { id: userId } },
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
          cart: { user: { id: userId } },
          variant,
          quantity: item.quantity,
        });

        await cartItemRepo.save(cartItem).catch(async (error: unknown) => {
          if (!this.isUniqueConstraintError(error)) throw error;

          const concurrentItem = await cartItemRepo.findOne({
            where: {
              cart: { user: { id: userId } },
              variant: { id: variant.id },
            },
          });

          if (!concurrentItem) throw error;

          const retryRequestedQuantity = concurrentItem.quantity + item.quantity;
          this.assertVariantStock(variant, retryRequestedQuantity);

          concurrentItem.quantity = retryRequestedQuantity;
          await cartItemRepo.save(concurrentItem);
        });
      }

      return this.getCart(userId, manager);
    });
  }

  async updateItem(userId: number, id: number, item: UpdateCartItemDTO) {
    return this.cartRepo.manager.transaction(async (manager) => {
      const cart = await this.getCart(userId, manager);
      const cartItemRepo = manager.getRepository(CartItem);

      const cartItem = await cartItemRepo.findOne({
        where: { id, cart: { id: cart.id } },
        relations: { variant: { product: true } },
      });
      if (!cartItem) throw new NotFoundException('Cart item not found');

      this.assertVariantStock(cartItem.variant, item.quantity);

      if (item.quantity === 0) await cartItemRepo.delete({ id, cart: { id: cart.id } });
      else {
        cartItem.quantity = item.quantity;
        await cartItemRepo.save(cartItem);
      }

      return this.getCart(userId, manager);
    });
  }

  async clearCart(userId: number) {
    return this.cartRepo.manager.transaction(async (manager) => {
      const cartItemRepo = manager.getRepository(CartItem);

      const cart = await this.getCart(userId, manager);
      await cartItemRepo.delete({ cart: { id: cart.id } });

      return this.getCart(userId, manager);
    });
  }

  private assertVariantStock(variant: ProductVariantEntity, requestedQuantity: number) {
    if (requestedQuantity > variant.stock)
      throw new BadRequestException(`Insufficient stock for variant ${variant.externalId}`);
  }

  private isUniqueConstraintError(error: unknown) {
    if (!(error instanceof QueryFailedError)) return false;

    const driverError = error.driverError as { code?: string; message?: string } | undefined;

    return (
      driverError?.code === '23505' ||
      driverError?.code === 'SQLITE_CONSTRAINT' ||
      !!driverError?.message?.toLowerCase().includes('unique')
    );
  }
}
