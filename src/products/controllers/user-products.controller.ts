import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';

import { Public } from 'src/auth';
import { Serialize } from 'src/interceptors';

import { ProductDTO } from '../dtos/user';
import { ProductsService } from '../services';

@Controller('products')
@Serialize(ProductDTO)
export class UserProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Public()
  @Get()
  findAll() {
    return this.productsService.findAll();
  }
}
