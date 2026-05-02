import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { IS_PUBLIC_KEY } from 'src/auth/decorators/public.decorator';
import { LocaleContextService } from 'src/i18n/locale-context.service';
import { UsersService } from 'src/users/users.service';

import { UnauthorizedException } from '../common/exceptions';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly usersService: UsersService,
    private readonly reflector: Reflector,
    private readonly localeContextService: LocaleContextService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const req = context.switchToHttp().getRequest<Request>();
    req.res?.setHeader('x-is-logged-in', 'false');

    const userId = req.session?.userId;

    if (!userId) {
      if (isPublic) return true;

      throw UnauthorizedException('unauthenticated');
    }

    const user = await this.usersService.findOne(userId);
    if (!user) {
      if (isPublic) return true;

      throw UnauthorizedException('unauthorized');
    }

    this.localeContextService.locale = user.locale;
    req.res?.setHeader('x-locale', user.locale);
    req.res?.setHeader('x-is-logged-in', 'true');
    req.user = user;

    return true;
  }
}
