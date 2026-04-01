import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { UsersService } from 'src/users';
import { IS_PUBLIC_KEY } from 'src/auth';
import { UnauthorizedException } from 'src/common';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly usersService: UsersService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const req = context.switchToHttp().getRequest();
    const userId = req.session?.userId;

    if (isPublic) {
      if (userId) req.user = await this.usersService.findOne(userId).catch(() => null);

      return true;
    }

    if (!userId) throw new UnauthorizedException(['unauthorized']);

    const user = await this.usersService.findOne(userId);
    if (!user) throw new UnauthorizedException(['unauthenticated']);

    req.user = user;

    return true;
  }
}
