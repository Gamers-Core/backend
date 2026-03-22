import { UseInterceptors, type CallHandler, type ExecutionContext, type NestInterceptor } from '@nestjs/common';
import { plainToInstance, type ClassTransformOptions } from 'class-transformer';
import { map, type Observable } from 'rxjs';

interface ClassConstructor {
  new (...args: never[]): object;
}

type SerializeContext = {
  currentUserId: number;
};

type SerializeOptions = ClassTransformOptions & {
  context?: SerializeContext;
};

export const Serialize = (dto: ClassConstructor) => UseInterceptors(new SerializeInterceptor(dto));

export class SerializeInterceptor implements NestInterceptor {
  constructor(private dto: ClassConstructor) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const currentUserId = request?.currentUser?.id;
    const options: SerializeOptions = {
      excludeExtraneousValues: true,
      ...(currentUserId ? { context: { currentUserId } } : {}),
    };

    return next.handle().pipe(map((data) => plainToInstance(this.dto, data, options)));
  }
}
