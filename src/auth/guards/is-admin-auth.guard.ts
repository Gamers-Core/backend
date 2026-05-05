import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

import { ForbiddenException, UnauthorizedException } from 'src/common/exceptions';

@Injectable()
export class IsAdminAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();

    if (!req.user) throw UnauthorizedException('unauthenticated');

    if (!req.user.isAdmin) throw ForbiddenException('unauthorized');

    return true;
  }
}
