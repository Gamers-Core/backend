import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';

import { LocaleContextService } from 'src/i18n/locale-context.service';
import { OrdersModule } from 'src/orders/orders.module';

import { WhatsappController } from './whatsapp.controller';
import { WhatsAppService } from './whatsapp.service';

@Module({
  imports: [HttpModule, forwardRef(() => OrdersModule)],
  controllers: [WhatsappController],
  providers: [WhatsAppService, LocaleContextService],
  exports: [WhatsAppService],
})
export class WhatsappModule {}
