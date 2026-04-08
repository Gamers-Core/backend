import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';

import { Public } from 'src/auth';
import { Serialize } from 'src/interceptors';

import { CategoriesService } from './categories.service';
import { CategoryDTO } from './dtos';

@Controller('categories')
@Public()
@Serialize(CategoryDTO)
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}

  @Get()
  getAll() {
    return this.service.getAll();
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.getOne(id);
  }
}
