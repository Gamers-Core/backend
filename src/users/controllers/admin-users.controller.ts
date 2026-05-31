import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { IsAdminAuthGuard } from 'src/auth/guards/is-admin-auth.guard';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';

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
}
