import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';

import { IsAdminAuthGuard } from 'src/auth/guards/is-admin-auth.guard';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { Paginated } from 'src/common/pagination/pagination.dto';

import { DiscountsService } from '../discounts.service';
import { AdminDiscountDTO } from '../dtos/admin/admin-discount.dto';
import { AdminSearchDiscountsDTO } from '../dtos/admin/admin-search-discounts.dto';
import { CreateDiscountDTO } from '../dtos/admin/create-discount.dto';
import { DiscountUsageDTO } from '../dtos/admin/discount-usage.dto';
import { UpdateDiscountDTO } from '../dtos/admin/update-discount.dto';

@Controller('admin/discounts')
@UseGuards(IsAdminAuthGuard)
export class AdminDiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  @Get()
  @Serialize(Paginated(AdminDiscountDTO))
  search(@Query() query: AdminSearchDiscountsDTO) {
    return this.discountsService.search(query);
  }

  @Get(':id')
  @Serialize(AdminDiscountDTO)
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.discountsService.getOne(id);
  }

  @Post()
  @Serialize(AdminDiscountDTO)
  add(@Body() body: CreateDiscountDTO) {
    return this.discountsService.add(body);
  }

  @Patch(':id')
  @Serialize(AdminDiscountDTO)
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateDiscountDTO) {
    return this.discountsService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.discountsService.remove(id);
  }

  @Get(':id/usages')
  @Serialize(DiscountUsageDTO)
  getUsages(@Param('id', ParseIntPipe) id: number) {
    return this.discountsService.getUsages(id);
  }
}
