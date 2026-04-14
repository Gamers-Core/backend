import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';

import { Public } from 'src/auth/decorators';
import { Serialize } from 'src/interceptors';

import { ProductDTO } from '../dtos/user';
import { ProductsService } from '../services';

@Controller('products')
@Serialize(ProductDTO)
@Public()
export class UserProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('many')
  findMany(@Query('ids') ids: string) {
    return this.productsService.findMany(ids);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id/recommendations')
  getRecommendations(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.getRecommendations(id);
  }
}
