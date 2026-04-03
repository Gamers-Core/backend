import {
  Injectable,
  mixin,
  UseInterceptors,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from '@nestjs/common';
import { plainToInstance, type ClassTransformOptions } from 'class-transformer';
import { Request } from 'express';
import { map, type Observable } from 'rxjs';

import { LocaleContextService } from 'src/i18n';

import 'src/types/class-transformer-options';

interface ClassConstructor {
  new (...args: never[]): object;
}

export const Serialize = (dto: ClassConstructor) => UseInterceptors(SerializeInterceptor(dto));

export const SerializeInterceptor = (dto: ClassConstructor) => {
  @Injectable()
  class MixinInterceptor implements NestInterceptor {
    constructor(public readonly localeContext: LocaleContextService) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
      const request = context.switchToHttp().getRequest<Request>();
      const options: ClassTransformOptions = {
        excludeExtraneousValues: true,
        context: {
          locale: this.localeContext.locale,
          userId: request.user?.id,
        },
      };

      return next.handle().pipe(map((data) => plainToInstance(dto, data, options)));
    }
  }

  return mixin(MixinInterceptor);
};
