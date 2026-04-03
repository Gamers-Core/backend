import { Global, Module } from '@nestjs/common';

import { LocaleContextService } from './locale-context.service';
import { LocaleContextMiddleware } from './locale-context.middleware';

@Global()
@Module({
  providers: [LocaleContextService, LocaleContextMiddleware],
  exports: [LocaleContextService, LocaleContextMiddleware],
})
export class I18nModule {}
