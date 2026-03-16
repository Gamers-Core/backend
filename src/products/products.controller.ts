import { Body, Controller, Post } from '@nestjs/common';

import { Serialize } from 'src/interceptors';

import { CreateProductDTO, ProductDTO } from './dtos';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Serialize(ProductDTO)
  @Post()
  create(@Body() createProductDTO: CreateProductDTO) {
    return this.productsService.create(createProductDTO);
  }
}
