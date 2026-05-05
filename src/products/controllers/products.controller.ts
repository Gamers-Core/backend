import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';

import { Public } from 'src/auth/decorators/public.decorator';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';

import { ProductDTO } from '../dtos/user/product.dto';
import { SearchProductsDTO } from '../dtos/user/search-products.dto';
import { SearchDTO } from '../dtos/user/search.dto';
import { ProductsService } from '../services/products.service';

@Controller('products')
@Public()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('many')
  @Serialize(ProductDTO)
  getMany(@Query('ids') ids: string) {
    return this.productsService.getMany(ids);
  }

  @Get(':id')
  @Serialize(ProductDTO)
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.getOne(id);
  }

  @Get()
  @Serialize(SearchDTO)
  search(@Query() dto: SearchProductsDTO) {
    return this.productsService.search(dto, false);
  }

  @Get(':id/recommendations')
  @Serialize(ProductDTO)
  getRecommendations(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.getRecommendations(id);
  }
}
