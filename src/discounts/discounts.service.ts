import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { Brand } from 'src/brands/entities/brand.entity';
import { CartService } from 'src/cart/cart.service';
import { Category } from 'src/categories/entities/category.entity';
import { BadRequestException, ConflictException, NotFoundException } from 'src/common/exceptions';
import { withOptionalManager } from 'src/common/with-optional-manager';
import { Order } from 'src/orders/entities/order.entity';
import { Variant } from 'src/products/entities/variant.entity';
import { CacheService } from 'src/redis/cache.service';
import { User } from 'src/users/entities/user.entity';

import { AdminSearchDiscountsDTO } from './dtos/admin/admin-search-discounts.dto';
import { CreateDiscountDTO } from './dtos/admin/create-discount.dto';
import { UpdateDiscountDTO } from './dtos/admin/update-discount.dto';
import { DiscountUsage } from './entities/discount-usage.entity';
import { Discount } from './entities/discount.entity';
import type { DiscountableItem, DiscountResult } from './types';

const DISCOUNT_RELATIONS = [
  'variants',
  'variants.product',
  'variants.image',
  'categories',
  'brands',
  'brands.image',
  'eligibleUsers',
];

@Injectable()
export class DiscountsService {
  constructor(
    @InjectRepository(Discount)
    private readonly discountRepo: Repository<Discount>,
    @InjectRepository(DiscountUsage)
    private readonly discountUsageRepo: Repository<DiscountUsage>,
    private readonly cacheService: CacheService,
    private readonly cartService: CartService,
  ) {}

  private cacheKey(code: string): string {
    return `discount:${code}`;
  }

  private readonly AUTOMATIC_CACHE_KEY = 'discounts:automatic';

  search({ q, method, target, eligibility, sort = 'created-descending' }: AdminSearchDiscountsDTO = {}) {
    const trimmedQ = q?.trim();

    const qb = this.discountRepo
      .createQueryBuilder('discount')
      .leftJoinAndSelect('discount.variants', 'variant')
      .leftJoinAndSelect('discount.categories', 'category')
      .leftJoinAndSelect('discount.brands', 'brand')
      .leftJoinAndSelect('discount.eligibleUsers', 'eligibleUser');

    if (trimmedQ) qb.andWhere('discount.code ILIKE :q', { q: `%${trimmedQ}%` });
    if (method) qb.andWhere('discount.method = :method', { method });
    if (target) qb.andWhere('discount.target = :target', { target });
    if (eligibility) qb.andWhere('discount.eligibility = :eligibility', { eligibility });

    switch (sort) {
      case 'usage-ascending':
        qb.orderBy('discount.usageCount', 'ASC');
        break;

      case 'usage-descending':
        qb.orderBy('discount.usageCount', 'DESC');
        break;

      case 'expires-ascending':
        qb.orderBy('discount.expiresAt', 'ASC');
        break;

      case 'expires-descending':
        qb.orderBy('discount.expiresAt', 'DESC');
        break;

      case 'created-ascending':
        qb.orderBy('discount.createdAt', 'ASC');
        break;

      case 'created-descending':
      default:
        qb.orderBy('discount.createdAt', 'DESC');
        break;
    }

    qb.addOrderBy('discount.id', 'DESC');

    return qb.getMany();
  }

  getOne(id: number) {
    return this.getOneOrFail(id);
  }

  add({ variantIds, categoryIds, brandIds, eligibleUserIds, ...dto }: CreateDiscountDTO) {
    return this.discountRepo.manager.transaction(async (manager) => {
      const repo = manager.getRepository(Discount);

      if (dto.method === 'code') {
        const existing = await repo.exists({ where: { code: dto.code } });

        if (existing) throw ConflictException('discounts.alreadyExists');
      }

      const discount = await repo.save(
        repo.create({
          ...dto,
          code: dto.method === 'code' ? dto.code : null,
          variants: variantIds?.map((id) => ({ id })) as Variant[],
          categories: categoryIds?.map((id) => ({ id })) as Category[],
          brands: brandIds?.map((id) => ({ id })) as Brand[],
          eligibleUsers: eligibleUserIds?.map((id) => ({ id })) as User[],
        }),
      );

      if (discount.method === 'automatic') await this.cacheService.delete(this.AUTOMATIC_CACHE_KEY);

      return this.getOneOrFail(discount.id, manager);
    });
  }

  update(id: number, { variantIds, categoryIds, brandIds, eligibleUserIds, ...dto }: UpdateDiscountDTO) {
    return this.discountRepo.manager.transaction(async (manager) => {
      const repo = manager.getRepository(Discount);

      const discount = await this.getOneOrFail(id, manager);
      const previousCode = discount.code;

      Object.assign(discount, dto);

      if (dto.method !== undefined) discount.code = dto.method === 'code' ? (dto.code ?? discount.code) : null;
      if (variantIds !== undefined) discount.variants = variantIds.map((id) => ({ id })) as Variant[];
      if (categoryIds !== undefined) discount.categories = categoryIds.map((id) => ({ id })) as Category[];
      if (brandIds !== undefined) discount.brands = brandIds.map((id) => ({ id })) as Brand[];
      if (eligibleUserIds !== undefined) discount.eligibleUsers = eligibleUserIds.map((id) => ({ id })) as User[];

      await repo.save(discount);

      if (previousCode) await this.cacheService.delete(this.cacheKey(previousCode));
      if (discount.code && discount.code !== previousCode) await this.cacheService.delete(this.cacheKey(discount.code));
      if (discount.method === 'automatic' || previousCode) await this.cacheService.delete(this.AUTOMATIC_CACHE_KEY);

      return this.getOneOrFail(id, manager);
    });
  }

  remove(id: number) {
    return this.discountRepo.manager.transaction(async (manager) => {
      const repo = manager.getRepository(Discount);

      const discount = await this.getOneOrFail(id, manager);

      await repo.remove(discount);

      if (discount.code) await this.cacheService.delete(this.cacheKey(discount.code));
      await this.cacheService.delete(this.AUTOMATIC_CACHE_KEY);
    });
  }

  async getUsages(id: number) {
    await this.getOneOrFail(id);

    return this.discountUsageRepo.find({
      where: { discount: { id } },
      relations: ['user', 'order'],
      order: { createdAt: 'DESC' },
    });
  }

  async resolveDiscount(
    code: string | null,
    userId: number | null,
    cartItems: DiscountableItem[],
    orderTotal: number,
    manager?: EntityManager,
  ): Promise<DiscountResult | null> {
    return withOptionalManager(manager, this.discountRepo.manager, async (manager) => {
      if (code) return this.validateAndCalculateFromItems(code, userId, cartItems, orderTotal, manager);

      return this.getBestAutomaticDiscount(userId, cartItems, orderTotal, manager);
    });
  }

  async validateAndCalculate(userId: number, code: string | undefined): Promise<DiscountResult | null> {
    return this.discountRepo.manager.transaction(async (manager) => {
      const cart = await this.cartService.getOrCreateCart(userId, manager);

      const orderTotal = cart.items.reduce((sum, item) => sum + item.variant.price * item.quantity, 0);

      if (code) return this.validateAndCalculateFromItems(code, userId, cart.items, orderTotal, manager);

      return this.getBestAutomaticDiscount(userId, cart.items, orderTotal, manager);
    });
  }

  private async validateAndCalculateFromItems(
    code: string,
    userId: number | null,
    cartItems: DiscountableItem[],
    orderTotal: number,
    manager: EntityManager,
  ): Promise<DiscountResult> {
    const discount = await this.cacheService.getOrSet(this.cacheKey(code), () => this.getActiveByCode(code, manager), {
      ttlMs: 1000 * 60 * 5,
    });

    if (!discount) throw NotFoundException('discounts.invalidCode');

    discount.startsAt = discount.startsAt ? new Date(discount.startsAt) : null;
    discount.expiresAt = discount.expiresAt ? new Date(discount.expiresAt) : null;

    this.checkValidityWindow(discount);
    this.checkEligibility(discount, userId);
    await this.checkUsageLimits(discount, userId, manager);
    this.checkMinOrderAmount(discount, orderTotal);

    const result = this.calculateDiscount(discount, cartItems, orderTotal);

    if (result.discountAmount !== null && result.discountAmount <= 0)
      throw BadRequestException('discounts.notApplicable');

    return result;
  }

  async getAutomaticDiscount(userId: number): Promise<DiscountResult | null> {
    return withOptionalManager(undefined, this.discountRepo.manager, async (manager) => {
      const cart = await this.cartService.getOrCreateCart(userId, manager);

      if (!cart.items.length) return null;

      const orderTotal = cart.items.reduce((sum, item) => sum + item.variant.price * item.quantity, 0);

      return this.getBestAutomaticDiscount(userId, cart.items, orderTotal, manager);
    });
  }

  async getBestAutomaticDiscount(
    userId: number | null,
    cartItems: DiscountableItem[],
    orderTotal: number,
    manager?: EntityManager,
  ): Promise<DiscountResult | null> {
    return withOptionalManager(manager, this.discountRepo.manager, async (manager) => {
      const candidates = await this.cacheService.getOrSet(
        this.AUTOMATIC_CACHE_KEY,
        () => this.getActiveAutomaticDiscounts(manager),
        { ttlMs: 1000 * 60 * 5 },
      );

      let best: DiscountResult | null = null;

      for (const discount of candidates) {
        discount.startsAt = discount.startsAt ? new Date(discount.startsAt) : null;
        discount.expiresAt = discount.expiresAt ? new Date(discount.expiresAt) : null;

        try {
          this.checkValidityWindow(discount);
          this.checkMinOrderAmount(discount, orderTotal);
          this.checkEligibility(discount, userId);
          await this.checkUsageLimits(discount, userId, manager);
        } catch {
          continue;
        }

        const result = this.calculateDiscount(discount, cartItems, orderTotal);
        const effectiveValue = this.getEffectiveValue(result);

        if (effectiveValue <= 0) continue;

        if (!best) {
          best = result;
          continue;
        }

        const resultPriority = this.getPriority(result);
        const bestPriority = this.getPriority(best);

        if (resultPriority > bestPriority) {
          best = result;
          continue;
        }

        if (resultPriority === bestPriority && effectiveValue > this.getEffectiveValue(best)) best = result;
      }

      return best;
    });
  }

  private getEffectiveValue(result: DiscountResult) {
    return result.discountAmount === null ? Infinity : result.discountAmount;
  }

  private getPriority(result: DiscountResult) {
    return result.discount.eligibility === 'custom_users' ? 1 : 0;
  }

  private getActiveByCode(code: string, manager: EntityManager) {
    const repo = manager.getRepository(Discount);

    return repo.findOne({
      where: { code, method: 'code', isActive: true },
      relations: DISCOUNT_RELATIONS,
    });
  }

  private getActiveAutomaticDiscounts(manager: EntityManager) {
    const repo = manager.getRepository(Discount);

    return repo.find({
      where: { method: 'automatic', isActive: true },
      relations: DISCOUNT_RELATIONS,
    });
  }

  private checkValidityWindow(discount: Discount) {
    const now = new Date();

    if (discount.startsAt && now < discount.startsAt) throw BadRequestException('discounts.notYetActive');
    if (discount.expiresAt && now > discount.expiresAt) throw BadRequestException('discounts.expired');
  }

  private checkMinOrderAmount(discount: Discount, orderTotal: number) {
    if (discount.minOrderAmount && orderTotal < discount.minOrderAmount)
      throw BadRequestException(['discounts.minOrderAmountNotMet', { amount: discount.minOrderAmount }]);
  }

  private checkEligibility(discount: Discount, userId: number | null) {
    if (discount.eligibility === 'all_users') return;

    if (userId == null) throw BadRequestException('discounts.notEligible');
    if (!discount.eligibleUsers.some((user) => user.id === userId)) throw BadRequestException('discounts.notEligible');
  }

  private async checkUsageLimits(discount: Discount, userId: number | null, manager: EntityManager) {
    if (discount.usageLimit !== null) {
      const repo = manager.getRepository(Discount);

      const current = await repo.findOne({
        where: { id: discount.id },
        select: { id: true, usageCount: true },
      });

      if (current && current.usageCount >= discount.usageLimit)
        throw BadRequestException('discounts.usageLimitReached');
    }

    if (!discount.usageLimitPerUser || userId === null) return;

    const usageRepo = manager.getRepository(DiscountUsage);

    const userUsageCount = await usageRepo.count({ where: { discount: { id: discount.id }, user: { id: userId } } });

    if (userUsageCount >= discount.usageLimitPerUser) throw BadRequestException('discounts.userUsageLimitReached');
  }

  private calculateDiscount(discount: Discount, cartItems: DiscountableItem[], orderTotal: number): DiscountResult {
    if (discount.target === 'free_shipping') return { discount, discountAmount: null };

    const baseAmount = this.calculateBaseAmount(discount, cartItems, orderTotal);

    if (baseAmount <= 0) return { discount, discountAmount: 0 };

    let amount = discount.valueType === 'percentage' ? (baseAmount * discount.value!) / 100 : discount.value!;

    amount = Math.min(amount, baseAmount);
    if (discount.maxDiscountAmount) amount = Math.min(amount, discount.maxDiscountAmount);

    return { discount, discountAmount: Math.round(amount * 100) / 100 };
  }

  private calculateBaseAmount(discount: Discount, cartItems: DiscountableItem[], orderTotal: number): number {
    switch (discount.target) {
      case 'order':
        return orderTotal;

      case 'product': {
        const variantIds = new Set(discount.variants.map(({ id }) => id));

        return cartItems
          .filter(({ variant }) => variantIds.has(variant.id))
          .reduce((sum, item) => sum + item.variant.price * item.quantity, 0);
      }

      case 'category': {
        const categoryIds = new Set(discount.categories.map(({ id }) => id));

        return cartItems
          .filter(({ variant }) => variant.product.category && categoryIds.has(variant.product.category.id))
          .reduce((sum, item) => sum + item.variant.price * item.quantity, 0);
      }

      case 'brand': {
        const brandIds = new Set(discount.brands.map(({ id }) => id));

        return cartItems
          .filter(({ variant }) => variant.product.brand && brandIds.has(variant.product.brand.id))
          .reduce((sum, item) => sum + item.variant.price * item.quantity, 0);
      }

      default:
        return 0;
    }
  }

  async recordUsage(discount: Discount, userId: number, order: Order, result: DiscountResult, manager: EntityManager) {
    const repo = manager.getRepository(Discount);

    const locked = await repo
      .createQueryBuilder('discount')
      .setLock('pessimistic_write')
      .where('discount.id = :id', { id: discount.id })
      .getOne();

    if (locked && discount.usageLimit != null && locked.usageCount >= discount.usageLimit)
      throw BadRequestException('discounts.usageLimitReached');

    const usageRepo = manager.getRepository(DiscountUsage);
    await usageRepo.save(
      usageRepo.create({
        discount,
        user: { id: userId } as User,
        order,
        discountAmount: result.discountAmount,
      }),
    );

    await repo.increment({ id: discount.id }, 'usageCount', 1);

    if (discount.code) await this.cacheService.delete(this.cacheKey(discount.code));
    if (discount.method === 'automatic') await this.cacheService.delete(this.AUTOMATIC_CACHE_KEY);
  }

  private getOneOrFail(id: number, manager?: EntityManager): Promise<Discount> {
    return withOptionalManager(manager, this.discountRepo.manager, async (manager) => {
      const repo = manager.getRepository(Discount);

      const discount = await repo.findOne({
        where: { id },
        relations: DISCOUNT_RELATIONS,
      });

      if (!discount) throw NotFoundException('discounts.notFound');

      return discount;
    });
  }
}
