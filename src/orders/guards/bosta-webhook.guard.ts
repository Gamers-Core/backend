import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

import { UnauthorizedException } from 'src/common/exceptions/http.exceptions';
import { safeCompare } from 'src/common/safe-compare';
import { withEnvironment } from 'src/common/with-environment';
import { ConfigService } from 'src/config/config.service';

@Injectable()
export class BostaWebhookAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    return withEnvironment(
      (isValid) => {
        if (!isValid) return true;

        const req = context.switchToHttp().getRequest<Request>();
        const expectedSecret = this.configService.get('BOSTA_WEBHOOK_SECRET')!;
        const providedSecret = (req.headers['x-bosta-secret'] as string) ?? '';

        if (!safeCompare(providedSecret, expectedSecret)) throw UnauthorizedException('unauthorized');

        return true;
      },
      ['production'],
    );
  }
}
