import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { Controller, Get, Param, ParseIntPipe, Query, UseInterceptors } from '@nestjs/common';

import { Public } from 'src/auth/decorators/public.decorator';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { Paginated } from 'src/common/pagination/pagination.dto';

import { ProductRecommendationDTO } from '../dtos/user/product-recommendation.dto';
import { ProductDTO } from '../dtos/user/product.dto';
import { SearchProductsDTO } from '../dtos/user/search-products.dto';
import { SearchDTO } from '../dtos/user/search.dto';
import { SimpleProductDTO } from '../dtos/user/simple-product.dto';
import { ProductsService } from '../services/products.service';

@Controller('products')
@Public()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('many')
  @Serialize(SimpleProductDTO)
  getMany(@Query('ids') ids: string) {
    return this.productsService.getMany(ids);
  }

  @Get(':id')
  @Serialize(ProductDTO)
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.getOne(id);
  }

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(1000 * 60)
  @Get()
  @Serialize(Paginated(SearchDTO))
  search(@Query() dto: SearchProductsDTO) {
    return this.productsService.search(dto, false);
  }

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(1000 * 30)
  @Get(':id/recommendations')
  @Serialize(ProductRecommendationDTO)
  getRecommendations(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.getRecommendations(id);
  }
}
