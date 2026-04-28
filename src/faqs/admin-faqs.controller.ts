import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';

import { IsAdminAuthGuard } from 'src/guards/is-admin-auth.guard';
import { Serialize } from 'src/interceptors/serialize.interceptor';

import { AddFAQDTO } from './dtos/add-faq.dto';
import { AdminFAQDTO } from './dtos/admin-faq.dto';
import { ReorderFAQsDTO } from './dtos/reorder-faqs.dto';
import { UpdateFAQDTO } from './dtos/update-faq.dto';
import { FAQsService } from './faqs.service';

@Controller('admin/faqs')
@Serialize(AdminFAQDTO)
@UseGuards(IsAdminAuthGuard)
export class AdminFAQsController {
  constructor(private readonly faqsService: FAQsService) {}

  @Get()
  getAll() {
    return this.faqsService.getAll();
  }

  @Post()
  add(@Body() dto: AddFAQDTO) {
    return this.faqsService.add(dto);
  }

  @Patch('reorder')
  reorder(@Body() dto: ReorderFAQsDTO) {
    return this.faqsService.reorder(dto.ids);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFAQDTO) {
    return this.faqsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.faqsService.remove(id);
  }
}
