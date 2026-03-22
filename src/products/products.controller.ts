import { Body, Controller, Delete, Get, Patch, Param, ParseIntPipe, Post } from '@nestjs/common';

import { Serialize } from 'src/interceptors';

import { CreateProductDTO, ProductDTO, UpdateProductDTO } from './dtos';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Serialize(ProductDTO)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Serialize(ProductDTO)
  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Serialize(ProductDTO)
  @Post()
  create(@Body() createProductDTO: CreateProductDTO) {
    return this.productsService.create(createProductDTO);
  }

  @Serialize(ProductDTO)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateProductDTO: UpdateProductDTO) {
    return this.productsService.update(id, updateProductDTO);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.delete(id);
  }
}
