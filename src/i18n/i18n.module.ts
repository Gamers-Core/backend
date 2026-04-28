import { Global, Module } from '@nestjs/common';

import { LocaleContextMiddleware } from './locale-context.middleware';
import { LocaleContextService } from './locale-context.service';

@Global()
@Module({
  providers: [LocaleContextService, LocaleContextMiddleware],
  exports: [LocaleContextService, LocaleContextMiddleware],
})
export class I18nModule {}
