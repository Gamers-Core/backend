import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Brand } from 'src/brands/entities/brand.entity';
import { Category } from 'src/categories/entities/category.entity';
import { FAQ } from 'src/faqs/entities/faq.entity';
import { FeaturedVariant } from 'src/featured-variants/entities/featured-variant.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Policy } from 'src/policies/entities/policy.entity';
import { Product } from 'src/products/entities/product.entity';
import { UserReview } from 'src/user-reviews/entities/user-review.entity';

import { SidebarController } from './sidebar.controller';
import { SidebarService } from './sidebar.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Product, Brand, Category, FeaturedVariant, FAQ, Policy, UserReview])],
  controllers: [SidebarController],
  providers: [SidebarService],
})
export class SidebarModule {}
