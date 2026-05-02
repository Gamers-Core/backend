import { Body, Controller, Get, Param, ParseEnumPipe, Patch } from '@nestjs/common';

import { locales } from 'src/i18n/const';
import type { Locale } from 'src/i18n/types';
import { Serialize } from 'src/interceptors/serialize.interceptor';

import { CurrentUser } from './decorators/current-user.decorator';
import { BasicUserDTO } from './dtos/basic-user.dto';
import { FullUserDTO } from './dtos/full-user.dto';
import { UpdateMeDTO } from './dtos/update-me.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Serialize(BasicUserDTO)
  @Get('me')
  getCurrentUser(@CurrentUser() user: User) {
    return user;
  }

  @Serialize(BasicUserDTO)
  @Patch('me')
  updateCurrentUser(@CurrentUser() user: User, @Body() body: UpdateMeDTO) {
    return this.usersService.update(user.id, body);
  }

  @Serialize(FullUserDTO)
  @Get('me/full')
  getFullCurrentUser(@CurrentUser() user: User) {
    return this.usersService.findFull(user.id);
  }

  @Serialize(BasicUserDTO)
  @Patch('me/locale/:locale')
  updateLocale(@CurrentUser() user: User, @Param('locale', new ParseEnumPipe(locales)) locale: Locale) {
    return this.usersService.updateLocale(user.id, locale);
  }
}
