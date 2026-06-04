import { createHmac, timingSafeEqual } from 'crypto';

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

import { UnauthorizedException } from 'src/common/exceptions/http.exceptions';
import { withEnvironment } from 'src/common/with-environment';
import { ConfigService } from 'src/config/config.service';

@Injectable()
export class WhatsAppSignatureGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    return withEnvironment(
      (isValid) => {
        if (!isValid) return false;

        const req = context.switchToHttp().getRequest<Request & { rawBody?: Buffer }>();

        const signature = req.headers['x-hub-signature-256'];
        if (!signature || typeof signature !== 'string') throw UnauthorizedException('unauthorized');

        const rawBody = req.rawBody;
        if (!rawBody) throw UnauthorizedException('unauthorized');

        const appSecret = this.configService.get('WHATSAPP_APP_SECRET') ?? '';
        const expected = `sha256=${createHmac('sha256', appSecret).update(rawBody).digest('hex')}`;

        const sigBuffer = Buffer.from(signature);
        const expectedBuffer = Buffer.from(expected);

        if (sigBuffer.length !== expectedBuffer.length || !timingSafeEqual(sigBuffer, expectedBuffer))
          throw UnauthorizedException('unauthorized');

        return true;
      },
      ['production'],
    );
  }
}
