import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { ServiceUnavailableException } from 'src/common/exceptions';

import { SKIP_MAINTENANCE } from '../decorators/skip-maintenance.decorator';
import { SettingsService } from '../settings.service';

@Injectable()
export class MaintenanceGuard implements CanActivate {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    if (request.url.startsWith('/admin')) return true;

    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_MAINTENANCE, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skip) return true;

    const { enabled } = await this.settingsService.get('maintenanceMode');
    if (enabled) throw ServiceUnavailableException('settings.maintenanceMode.message');

    return true;
  }
}
