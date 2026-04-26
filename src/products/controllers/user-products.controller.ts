import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';

import { Public } from 'src/auth/decorators';
import { Serialize } from 'src/interceptors';

import { ProductDTO, SearchDTO, SearchProductsDTO } from '../dtos/user';
import { ProductsService } from '../services';

@Controller('products')
@Public()
export class UserProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('many')
  @Serialize(ProductDTO)
  findMany(@Query('ids') ids: string) {
    return this.productsService.findMany(ids);
  }

  @Get(':id')
  @Serialize(ProductDTO)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Get()
  @Serialize(SearchDTO)
  findAll(@Query() dto: SearchProductsDTO) {
    return this.productsService.search(dto, false);
  }

  @Get(':id/recommendations')
  @Serialize(ProductDTO)
  getRecommendations(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.getRecommendations(id);
  }
}
