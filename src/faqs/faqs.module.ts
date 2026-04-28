import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminFAQsController } from './admin-faqs.controller';
import { FAQ } from './entities/faq.entity';
import { FAQsController } from './faqs.controller';
import { FAQsService } from './faqs.service';

@Module({
  imports: [TypeOrmModule.forFeature([FAQ])],
  controllers: [FAQsController, AdminFAQsController],
  providers: [FAQsService],
})
export class FAQsModule {}
