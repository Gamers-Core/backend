import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';

import { Public } from 'src/auth/decorators/public.decorator';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';

import { CategoriesService } from '../categories.service';
import { CategoryDTO } from '../dtos/user/category.dto';

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
