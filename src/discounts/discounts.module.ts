import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CartModule } from 'src/cart/cart.module';
import { ProductsModule } from 'src/products/products.module';

import { AdminDiscountsController } from './controllers/admin-discounts.controller';
import { DiscountsController } from './controllers/discounts.controller';
import { DiscountsService } from './discounts.service';
import { DiscountUsage } from './entities/discount-usage.entity';
import { Discount } from './entities/discount.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Discount, DiscountUsage]), ProductsModule, CartModule],
  controllers: [DiscountsController, AdminDiscountsController],
  providers: [DiscountsService],
  exports: [DiscountsService],
})
export class DiscountsModule {}
