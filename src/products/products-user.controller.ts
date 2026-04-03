import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';

import { Serialize } from 'src/interceptors';

import { ProductDTO } from './dtos/user';
import { ProductsService } from './products.service';

@Controller('products')
@Serialize(ProductDTO)
export class ProductsUserController {
  constructor(private readonly productsService: ProductsService) {}

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }
}
