import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { Cart, CartItem, MediaAttachment, Variant } from 'src/entity';
import { MediaAttachmentService } from 'src/media';
import { InventoryService } from 'src/products';
import { cartItemRelations, cartRelations } from 'src/products';
import { withOptionalManager, BadRequestException, NotFoundException, isUniqueViolation } from 'src/common';

import { CreateCartItemDTO, UpdateCartItemDTO } from './dtos';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private readonly cartRepo: Repository<Cart>,
    private readonly inventoryService: InventoryService,
    private readonly mediaAttachmentService: MediaAttachmentService,
  ) {}

  async getCart(userId: number, manager?: EntityManager) {
    return withOptionalManager(manager, this.cartRepo.manager, async (manager) => {
      const cartRepo = manager.getRepository(Cart);

      const cart = await cartRepo.findOne({
        where: { user: { id: userId } },
        relations: cartRelations,
      });

      if (!cart) {
        const newCart = await cartRepo
          .save(cartRepo.create({ user: { id: userId }, items: [] }))
          .catch(async (error) => {
            if (!isUniqueViolation(error)) throw error;

            return cartRepo.findOneOrFail({
              where: { user: { id: userId } },
              relations: cartRelations,
            });
          });

        return this.withVariantImageURLs(newCart, manager);
      }

      return this.withVariantImageURLs(cart, manager);
    });
  }

  async sync(userId: number, items: CreateCartItemDTO[]) {
    return this.cartRepo.manager.transaction(async (manager) => {
      const cart = await this.getCart(userId, manager);
      const cartItemRepo = manager.getRepository(CartItem);

      await cartItemRepo.delete({ cart: { id: cart.id } });

      for (const item of items) {
        const variant = await this.inventoryService.findByExternalId(item.externalId, manager);
        this.assertVariantStock(variant, item.quantity);

        const cartItem = cartItemRepo.create({
          cart: { id: cart.id },
          variant,
          quantity: item.quantity,
        });

        await cartItemRepo.save(cartItem);
      }

      return this.getCart(userId, manager);
    });
  }

  async addItem(userId: number, item: CreateCartItemDTO) {
    return this.cartRepo.manager.transaction(async (manager) => {
      const cart = await this.getCart(userId, manager);
      const cartItemRepo = manager.getRepository(CartItem);
      const variant = await this.inventoryService.findByExternalId(item.externalId, manager);

      const existingItem = await cartItemRepo.findOne({
        where: {
          cart: { id: cart.id },
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
          cart: { id: cart.id },
          variant,
          quantity: item.quantity,
        });

        await cartItemRepo.save(cartItem).catch(async (error) => {
          if (!isUniqueViolation(error)) throw error;

          const concurrentItem = await cartItemRepo.findOne({
            where: {
              cart: { id: cart.id },
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
        relations: cartItemRelations,
      });
      if (!cartItem) throw new NotFoundException('cart.itemNotFound');

      this.assertVariantStock(cartItem.variant, item.quantity);

      if (item.quantity === 0) await cartItemRepo.delete({ id, cart: { id: cart.id } });
      else {
        cartItem.quantity = item.quantity;
        await cartItemRepo.save(cartItem);
      }

      return this.getCart(userId, manager);
    });
  }

  async clearCart(userId: number, manager?: EntityManager) {
    return withOptionalManager(manager, this.cartRepo.manager, async (entityManager) => {
      const cartItemRepo = entityManager.getRepository(CartItem);

      const cart = await this.getCart(userId, entityManager);
      await cartItemRepo.delete({ cart: { id: cart.id } });

      return this.getCart(userId, entityManager);
    });
  }

  private assertVariantStock(variant: Variant, requestedQuantity: number) {
    if (requestedQuantity > variant.stock)
      throw new BadRequestException(['cart.insufficientStock', { externalId: variant.externalId }]);
  }

  private async withVariantImageURLs(cart: Cart, manager: EntityManager) {
    if (!cart.items.length) return cart;

    const variantIds = cart.items.map(({ variant }) => variant.id);
    const brandIds = Array.from(new Set(cart.items.map(({ variant }) => variant.product.brand.id)));

    const attachmentRepo = manager.getRepository(MediaAttachment);
    const [variantMediaMap, productMediaMap, brandMediaMap] = await Promise.all([
      this.mediaAttachmentService.getBulkMedia(variantIds, 'variant', attachmentRepo),
      this.mediaAttachmentService.getBulkMedia(
        cart.items.map(({ variant }) => variant.product.id),
        'product',
        attachmentRepo,
      ),
      this.mediaAttachmentService.getBulkMedia(brandIds, 'brand', attachmentRepo),
    ]);

    for (const item of cart.items) {
      const variantWithImage = item.variant;
      variantWithImage['imageURL'] =
        variantMediaMap[item.variant.id]?.[0]?.media.url ?? productMediaMap[item.variant.product.id][0].media.url;
      Object.assign(item.variant.product.brand, {
        image: brandMediaMap[item.variant.product.brand.id]?.[0] ?? null,
      });
    }

    return cart;
  }
}
