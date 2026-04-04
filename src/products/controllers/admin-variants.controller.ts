import { Body, Controller, Delete, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';

import { IsAdminAuthGuard } from 'src/guards/is-admin-auth.guard';
import { Serialize } from 'src/interceptors';

import { AdminVariantDTO, CreateVariantDTO, UpdateVariantDTO } from '../dtos/admin';
import { VariantsService } from '../services';

@Controller('admin/products/:productId/variants')
@UseGuards(IsAdminAuthGuard)
export class AdminVariantsController {
  constructor(private readonly variantsService: VariantsService) {}

  @Post()
  @Serialize(AdminVariantDTO)
  add(@Param('productId', ParseIntPipe) productId: number, @Body() dtos: CreateVariantDTO[]) {
    return this.variantsService.add(productId, dtos);
  }

  @Patch(':variantId')
  @Serialize(AdminVariantDTO)
  update(
    @Param('productId', ParseIntPipe) productId: number,
    @Param('variantId', ParseIntPipe) variantId: number,
    @Body() updateVariantDTO: UpdateVariantDTO,
  ) {
    return this.variantsService.updateOne(productId, variantId, updateVariantDTO);
  }

  @Delete(':variantId')
  remove(@Param('productId', ParseIntPipe) productId: number, @Param('variantId', ParseIntPipe) variantId: number) {
    return this.variantsService.removeOne(productId, variantId);
  }
}
