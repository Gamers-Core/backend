import { Global, Module } from '@nestjs/common';

import { I18nService } from './i18n.service';
import { LocaleContextService } from './locale-context.service';
import { LocaleContextMiddleware } from './locale-context.middleware';

@Global()
@Module({
  providers: [I18nService, LocaleContextService, LocaleContextMiddleware],
  exports: [I18nService, LocaleContextService, LocaleContextMiddleware],
})
export class I18nModule {}
