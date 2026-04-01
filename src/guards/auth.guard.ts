import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';

import { UsersService } from 'src/users';
import { IS_PUBLIC_KEY } from 'src/auth';
import { UnauthorizedException } from 'src/common';
import { LocaleContextService } from 'src/i18n';

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
    const userId = req.session?.userId;

    if (!userId) {
      if (isPublic) return true;

      throw new UnauthorizedException(['unauthorized']);
    }

    const user = await this.usersService.findOne(userId);
    if (!user) {
      if (isPublic) return true;

      throw new UnauthorizedException(['unauthenticated']);
    }

    this.localeContextService.setCurrentUserLocale(user.locale);
    req.locale = this.localeContextService.locale;
    req.user = user;

    return true;
  }
}
