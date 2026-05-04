import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';

import { IsAdminAuthGuard } from 'src/auth/guards/is-admin-auth.guard';
import { Serialize } from 'src/interceptors/serialize.interceptor';

import { BrandsService } from '../brands.service';
import { AddBrandDTO } from '../dtos/admin/add-brand.dto';
import { AdminBrandDTO } from '../dtos/admin/admin-brand.dto';
import { UpdateBrandDTO } from '../dtos/admin/update-brand.dto';

@Controller('admin/brands')
@UseGuards(IsAdminAuthGuard)
export class AdminBrandsController {
  constructor(private readonly service: BrandsService) {}

  @Get()
  @Serialize(AdminBrandDTO)
  getAll() {
    return this.service.getAll();
  }

  @Get(':id')
  @Serialize(AdminBrandDTO)
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.getOne(id);
  }

  @Post()
  @Serialize(AdminBrandDTO)
  add(@Body() dto: AddBrandDTO) {
    return this.service.add(dto);
  }

  @Patch(':id')
  @Serialize(AdminBrandDTO)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBrandDTO) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
