import { Controller, Get, UseGuards } from '@nestjs/common';

import { IsAdminAuthGuard } from 'src/auth/guards/is-admin-auth.guard';

import { SidebarService } from './sidebar.service';

@Controller('admin/sidebar')
@UseGuards(IsAdminAuthGuard)
export class SidebarController {
  constructor(private readonly sidebarService: SidebarService) {}

  @Get('stats')
  getCounts() {
    return this.sidebarService.getCounts();
  }
}
