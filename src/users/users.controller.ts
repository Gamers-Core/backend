import { Controller, Get } from '@nestjs/common';

import { User } from 'src/entity';

import { CurrentUser } from './decorators';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getCurrentUser(@CurrentUser() user: User) {
    return user;
  }

  @Get('me/full')
  getFullCurrentUser(@CurrentUser() user: User) {
    return this.usersService.findFull(user.id);
  }
}
