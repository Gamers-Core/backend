import { Controller, Get } from '@nestjs/common';

import { User } from 'src/entity';
import { Serialize } from 'src/interceptors';

import { CurrentUser } from './decorators';
import { UsersService } from './users.service';
import { BasicUserDTO, FullUserDTO } from './dtos';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Serialize(BasicUserDTO)
  @Get('me')
  getCurrentUser(@CurrentUser() user: User) {
    return user;
  }

  @Serialize(FullUserDTO)
  @Get('me/full')
  getFullCurrentUser(@CurrentUser() user: User) {
    return this.usersService.findFull(user.id);
  }
}
