import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

import { UnauthorizedException } from 'src/common/exceptions/http.exceptions';
import { safeCompare } from 'src/common/safe-compare';
import { withEnvironment } from 'src/common/with-environment';
import { ConfigService } from 'src/config/config.service';

import { WhatsAppWebhookVerificationQuery } from '../types';

@Injectable()
export class WhatsAppVerifyWebhookGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    return withEnvironment(
      (isValid) => {
        if (!isValid) return true;

        const req = context
          .switchToHttp()
          .getRequest<
            Request<
              { [key: string]: string | string[]; [key: number]: string },
              undefined,
              undefined,
              WhatsAppWebhookVerificationQuery
            >
          >();
        const expectedSecret = this.configService.get('WHATSAPP_WEBHOOK_SECRET') ?? '';
        const providedSecret = req.query.hub_verify_token ?? '';

        if (!safeCompare(providedSecret, expectedSecret)) throw UnauthorizedException('unauthorized');

        return true;
      },
      ['local', 'production'],
    );
  }
}
