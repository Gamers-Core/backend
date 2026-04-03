import { UseInterceptors, type CallHandler, type ExecutionContext, type NestInterceptor } from '@nestjs/common';
import { plainToInstance, type ClassTransformOptions } from 'class-transformer';
import { Request } from 'express';
import { map, type Observable } from 'rxjs';

import 'src/types/class-transformer-options';

interface ClassConstructor {
  new (...args: never[]): object;
}

export const Serialize = (dto: ClassConstructor) => UseInterceptors(new SerializeInterceptor(dto));

export class SerializeInterceptor implements NestInterceptor {
  constructor(private dto: ClassConstructor) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const { locale, user } = context.switchToHttp().getRequest<Request>();

    const options: ClassTransformOptions = {
      excludeExtraneousValues: true,
      context: { locale, userId: user?.id },
    };

    return next.handle().pipe(map((data) => plainToInstance(this.dto, data, options)));
  }
}
