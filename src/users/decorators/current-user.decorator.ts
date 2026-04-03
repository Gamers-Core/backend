import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const CurrentUser = createParamDecorator((data: never, context: ExecutionContext) => {
  const req = context.switchToHttp().getRequest<Request>();

  return req.user;
});
