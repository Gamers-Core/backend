import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';

import { IsAdminAuthGuard } from 'src/guards/is-admin-auth.guard';
import { Serialize } from 'src/interceptors/serialize.interceptor';

import { CategoriesService } from './categories.service';
import { AddCategoryDTO } from './dtos/add-category.dto';
import { AdminCategoryDTO } from './dtos/admin-category.dto';
import { UpdateCategoryDTO } from './dtos/update-category.dto';

@Controller('admin/categories')
@UseGuards(IsAdminAuthGuard)
export class AdminCategoriesController {
  constructor(private readonly service: CategoriesService) {}

  @Get()
  @Serialize(AdminCategoryDTO)
  getAll() {
    return this.service.getAll();
  }

  @Get(':id')
  @Serialize(AdminCategoryDTO)
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.getOne(id);
  }

  @Post()
  @Serialize(AdminCategoryDTO)
  add(@Body() dto: AddCategoryDTO) {
    return this.service.add(dto);
  }

  @Patch(':id')
  @Serialize(AdminCategoryDTO)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoryDTO) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
