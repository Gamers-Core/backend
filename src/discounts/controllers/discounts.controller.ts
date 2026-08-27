import { Controller, Get, Query } from '@nestjs/common';

import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import type { PaymentMethod } from 'src/orders/types';
import { CurrentUser } from 'src/users/decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';

import { DiscountsService } from '../discounts.service';
import { DiscountDTO } from '../dtos/user/discount.dto';

@Controller('discounts')
@Serialize(DiscountDTO)
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  @Get()
  async getDiscount(
    @CurrentUser() user: User,
    @Query('code') code: string | undefined,
    @Query('paymentMethod') paymentMethod: PaymentMethod | undefined,
  ) {
    const result = await this.discountsService.validateAndCalculate(
      user.id,
      code ? code : undefined,
      paymentMethod ?? null,
    );

    if (!result) return null;

    return {
      code: result.discount.code,
      discountAmount: result.discountAmount,
      isFreeShipping: result.discount.target === 'free_shipping',
    };
  }
}
