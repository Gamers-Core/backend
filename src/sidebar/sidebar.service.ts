import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, LessThanOrEqual, MoreThan, Not, Or, Repository } from 'typeorm';

import { Brand } from 'src/brands/entities/brand.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Discount } from 'src/discounts/entities/discount.entity';
import { FeaturedVariant } from 'src/featured-variants/entities/featured-variant.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';

import { SidebarCountsByUrl } from './types';

@Injectable()
export class SidebarService {
  constructor(
    @InjectRepository(Order) private readonly ordersRepo: Repository<Order>,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    @InjectRepository(Product) private readonly productsRepo: Repository<Product>,
    @InjectRepository(Brand) private readonly brandsRepo: Repository<Brand>,
    @InjectRepository(Category) private readonly categoriesRepo: Repository<Category>,
    @InjectRepository(FeaturedVariant) private readonly featuredVariantsRepo: Repository<FeaturedVariant>,
    @InjectRepository(Discount) private readonly discountsRepo: Repository<Discount>,
  ) {}

  async getCounts(): Promise<SidebarCountsByUrl> {
    const now = new Date();

    const [orders, users, products, brands, categories, featuredVariants, discounts] = await Promise.all([
      this.ordersRepo.count({ where: { status: In(['confirmed', 'on-progress', 'on-hold']) } }),
      this.usersRepo.count({ where: { isAdmin: false, name: Not(IsNull()) } }),
      this.productsRepo.count({ where: { status: 'active' } }),
      this.brandsRepo.count(),
      this.categoriesRepo.count(),
      this.featuredVariantsRepo.count(),
      this.discountsRepo.count({
        where: { isActive: true, startsAt: Or(IsNull(), LessThanOrEqual(now)), expiresAt: Or(IsNull(), MoreThan(now)) },
      }),
    ]);

    return {
      '/orders': orders,
      '/users': users,
      '/products': products,
      '/brands': brands,
      '/categories': categories,
      '/featured-variants': featuredVariants,
      '/discounts': discounts,
    };
  }
}
