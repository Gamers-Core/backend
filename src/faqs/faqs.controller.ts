import { Controller, Get } from '@nestjs/common';

import { Public } from 'src/auth/decorators/public.decorator';
import { Serialize } from 'src/interceptors/serialize.interceptor';

import { FAQDTO } from './dtos/faq.dto';
import { FAQsService } from './faqs.service';

@Controller('faqs')
@Serialize(FAQDTO)
@Public()
export class FAQsController {
  constructor(private readonly faqsService: FAQsService) {}

  @Get()
  getAll() {
    return this.faqsService.getAll();
  }
}
