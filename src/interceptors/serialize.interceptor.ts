import { UseInterceptors, type CallHandler, type ExecutionContext, type NestInterceptor } from '@nestjs/common';
import { plainToInstance, type ClassTransformOptions } from 'class-transformer';
import { map, type Observable } from 'rxjs';

interface ClassConstructor {
  new (...args: never[]): object;
}

type SerializeContext = {
  userId: number;
};

type SerializeOptions = ClassTransformOptions & {
  context?: SerializeContext;
};

export const Serialize = (dto: ClassConstructor) => UseInterceptors(new SerializeInterceptor(dto));

export class SerializeInterceptor implements NestInterceptor {
  constructor(private dto: ClassConstructor) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const userId = request?.user?.id;
    const options: SerializeOptions = {
      excludeExtraneousValues: true,
      ...(userId ? { context: { userId: userId } } : {}),
    };

    return next.handle().pipe(map((data) => plainToInstance(this.dto, data, options)));
  }
}
