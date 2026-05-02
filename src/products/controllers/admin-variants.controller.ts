import { Body, Controller, Delete, Param, ParseArrayPipe, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';

import { IsAdminAuthGuard } from 'src/guards/is-admin-auth.guard';
import { Serialize } from 'src/interceptors/serialize.interceptor';

import { AdminVariantDTO } from '../dtos/admin/admin-variant.dto';
import { CreateVariantDTO } from '../dtos/admin/create-variant.dto';
import { UpdateVariantDTO } from '../dtos/admin/update-variant.dto';
import { VariantsService } from '../services/variants.service';

@Controller('admin/products/:productId/variants')
@UseGuards(IsAdminAuthGuard)
export class AdminVariantsController {
  constructor(private readonly variantsService: VariantsService) {}

  @Post()
  @Serialize(AdminVariantDTO)
  add(
    @Param('productId', ParseIntPipe) productId: number,
    @Body(new ParseArrayPipe({ items: CreateVariantDTO })) dtos: CreateVariantDTO[],
  ) {
    return this.variantsService.add(productId, dtos);
  }

  @Patch(':variantId')
  @Serialize(AdminVariantDTO)
  update(
    @Param('productId', ParseIntPipe) productId: number,
    @Param('variantId', ParseIntPipe) variantId: number,
    @Body() updateVariantDTO: UpdateVariantDTO,
  ) {
    return this.variantsService.update(productId, variantId, updateVariantDTO);
  }

  @Delete(':variantId')
  remove(@Param('productId', ParseIntPipe) productId: number, @Param('variantId', ParseIntPipe) variantId: number) {
    return this.variantsService.remove(productId, variantId);
  }
}
