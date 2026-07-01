import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';

import { IsAdminAuthGuard } from 'src/auth/guards/is-admin-auth.guard';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';

import { DiscountsService } from '../discounts.service';
import { AdminDiscountDTO } from '../dtos/admin/admin-discount.dto';
import { AdminSearchDiscountsDTO } from '../dtos/admin/admin-search-discounts.dto';
import { CreateDiscountDTO } from '../dtos/admin/create-discount.dto';
import { UpdateDiscountDTO } from '../dtos/admin/update-discount.dto';

@Controller('admin/discounts')
@UseGuards(IsAdminAuthGuard)
@Serialize(AdminDiscountDTO)
export class AdminDiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  @Get()
  search(@Query() query: AdminSearchDiscountsDTO) {
    return this.discountsService.search(query);
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.discountsService.getOne(id);
  }

  @Post()
  add(@Body() body: CreateDiscountDTO) {
    return this.discountsService.add(body);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateDiscountDTO) {
    return this.discountsService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.discountsService.remove(id);
  }

  @Get(':id/usages')
  getUsages(@Param('id', ParseIntPipe) id: number) {
    return this.discountsService.getUsages(id);
  }
}
