import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

import { ForbiddenException, UnauthorizedException } from 'src/common/exceptions';
import { defaultLocale } from 'src/i18n/const';
import { LocaleContextService } from 'src/i18n/locale-context.service';

@Injectable()
export class IsAdminAuthGuard implements CanActivate {
  constructor(private readonly localeContextService: LocaleContextService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();

    if (!req.user) throw UnauthorizedException('unauthenticated');

    if (!req.user.isAdmin) throw ForbiddenException('unauthorized');

    this.localeContextService.locale = defaultLocale;
    req.res?.setHeader('x-locale', defaultLocale);

    return true;
  }
}
