import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { UsersService } from 'src/users';
import { IS_PUBLIC_KEY } from 'src/auth';

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
      if (userId)
        req.currentUser = await this.usersService
          .findOne(userId)
          .catch(() => null);

      return true;
    }

    if (!userId) throw new UnauthorizedException('Not authenticated');

    const user = await this.usersService.findOne(userId);
    if (!user) throw new UnauthorizedException('User not found');

    req.currentUser = user;

    return true;
  }
}
