import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';

import { IsAdminAuthGuard } from 'src/auth/guards/is-admin-auth.guard';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';

import { AdminCreateUserDTO } from '../dtos/admin/admin-create-user.dto';
import { AdminSearchUsersDTO } from '../dtos/admin/admin-search-users.dto';
import { AdminUserDTO } from '../dtos/admin/admin-user.dto';
import { UsersService } from '../users.service';

@Controller('admin/users')
@UseGuards(IsAdminAuthGuard)
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Serialize(AdminUserDTO)
  getAll(@Query() dto: AdminSearchUsersDTO) {
    return this.usersService.getAllForAdmin(dto);
  }

  @Serialize(AdminUserDTO)
  @Get(':id')
  getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getFull(id);
  }

  @Serialize(AdminUserDTO)
  @Post()
  createUser(@Body() dto: AdminCreateUserDTO) {
    return this.usersService.createForAdmin(dto);
  }

  @Serialize(AdminUserDTO)
  @Post(':id')
  updateUser(@Param('id', ParseIntPipe) id: number, @Body() dto: AdminCreateUserDTO) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
