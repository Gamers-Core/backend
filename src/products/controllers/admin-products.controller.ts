import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';

import { IsAdminAuthGuard } from 'src/guards/is-admin-auth.guard';
import { Serialize } from 'src/interceptors';

import { AdminProductDTO, CreateProductDTO, UpdateProductDTO } from '../dtos/admin';
import { ProductsService } from '../services';

@Controller('admin/products')
@UseGuards(IsAdminAuthGuard)
export class AdminProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get(':id')
  @Serialize(AdminProductDTO)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Get()
  @Serialize(AdminProductDTO)
  findAll() {
    return this.productsService.findAll();
  }

  @Post()
  @Serialize(AdminProductDTO)
  create(@Body() createProductDTO: CreateProductDTO) {
    return this.productsService.create(createProductDTO);
  }

  @Patch(':id')
  @Serialize(AdminProductDTO)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateProductDTO: UpdateProductDTO) {
    return this.productsService.update(id, updateProductDTO);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.delete(id);
  }
}
