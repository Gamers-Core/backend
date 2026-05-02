import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';

import { IsAdminAuthGuard } from 'src/guards/is-admin-auth.guard';
import { Serialize } from 'src/interceptors/serialize.interceptor';

import { AddFeaturedVariantDTO } from '../dtos/admin/add-featured-variant.dto';
import { AdminFeaturedVariantDTO } from '../dtos/admin/admin-featured-variant.dto';
import { ReorderFeaturedVariantsDTO } from '../dtos/admin/reorder-featured-variants.dto';
import { UpdateFeaturedVariantDTO } from '../dtos/admin/update-featured-variant.dto';
import { FeaturedVariantsService } from '../featured-variants.service';

@Controller('admin/featured-variants')
@UseGuards(IsAdminAuthGuard)
export class AdminFeaturedVariantsController {
  constructor(private readonly service: FeaturedVariantsService) {}

  @Get()
  @Serialize(AdminFeaturedVariantDTO)
  getAll() {
    return this.service.getAll();
  }

  @Post()
  @Serialize(AdminFeaturedVariantDTO)
  add(@Body() dto: AddFeaturedVariantDTO) {
    return this.service.add(dto);
  }

  @Patch('reorder')
  reorder(@Body() dto: ReorderFeaturedVariantsDTO) {
    return this.service.reorder(dto.orderedIds);
  }

  @Patch(':id')
  @Serialize(AdminFeaturedVariantDTO)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFeaturedVariantDTO) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
