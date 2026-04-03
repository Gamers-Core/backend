import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';

import { IsAdminAuthGuard } from 'src/guards/is-admin-auth.guard';
import { Serialize } from 'src/interceptors';

import { AdminProductDTO, CreateProductDTO, UpdateProductDTO } from './dtos/admin';
import { ProductsService } from './products.service';

@Controller('admin/products')
@UseGuards(IsAdminAuthGuard)
@Serialize(AdminProductDTO)
export class ProductsAdminController {
  constructor(private readonly productsService: ProductsService) {}

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Post()
  create(@Body() createProductDTO: CreateProductDTO) {
    return this.productsService.create(createProductDTO);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateProductDTO: UpdateProductDTO) {
    return this.productsService.update(id, updateProductDTO);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.delete(id);
  }
}
