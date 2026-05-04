import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';

import { IsAdminAuthGuard } from 'src/auth/guards/is-admin-auth.guard';
import { Serialize } from 'src/interceptors/serialize.interceptor';

import { AdminProductDTO } from '../dtos/admin/admin-product.dto';
import { AdminSearchProductsDTO } from '../dtos/admin/admin-search-products.dto';
import { CreateProductDTO } from '../dtos/admin/create-product.dto';
import { UpdateProductDTO } from '../dtos/admin/update-product.dto';
import { ProductsService } from '../services/products.service';

@Controller('admin/products')
@UseGuards(IsAdminAuthGuard)
export class AdminProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get(':id')
  @Serialize(AdminProductDTO)
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.getOne(id);
  }

  @Get()
  @Serialize(AdminProductDTO)
  search(@Query() dto: AdminSearchProductsDTO) {
    return this.productsService.search(dto, true);
  }

  @Post()
  @Serialize(AdminProductDTO)
  add(@Body() createProductDTO: CreateProductDTO) {
    return this.productsService.add(createProductDTO);
  }

  @Patch(':id')
  @Serialize(AdminProductDTO)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateProductDTO: UpdateProductDTO) {
    return this.productsService.update(id, updateProductDTO);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
