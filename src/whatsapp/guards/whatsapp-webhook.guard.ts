import { timingSafeEqual } from 'crypto';

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

import { UnauthorizedException } from 'src/common/exceptions/http.exceptions';
import { withEnvironment } from 'src/common/with-environment';
import { ConfigService } from 'src/config/config.service';

import { WhatsAppWebhookVerificationQuery } from '../types';

const safeCompare = (a: string, b: string): boolean => {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);

  if (bufA.length !== bufB.length) return false;

  return timingSafeEqual(bufA, bufB);
};

@Injectable()
export class WhatsAppWebhookGuard implements CanActivate {
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
        const expectedSecret = this.configService.get('WHATSAPP_WEBHOOK_SECRET');
        const providedSecret = req.query.hub_verify_token ?? '';

        if (!safeCompare(providedSecret, expectedSecret)) throw UnauthorizedException('unauthorized');

        return true;
      },
      ['local', 'production'],
    );
  }
}
