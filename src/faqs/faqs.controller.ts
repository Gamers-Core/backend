import { Controller, Get } from '@nestjs/common';

import { Public } from 'src/auth';
import { Serialize } from 'src/interceptors';

import { FAQDTO } from './dtos';
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
