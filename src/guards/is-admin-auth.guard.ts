import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

import { ForbiddenException, UnauthorizedException } from 'src/common';

@Injectable()
export class IsAdminAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();

    if (!req.user) {
      throw new UnauthorizedException('unauthenticated');
    }

    if (!req.user.isAdmin) {
      throw new ForbiddenException('unauthorized');
    }

    return true;
  }
}
