import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

import { UnauthorizedException } from 'src/common/exceptions/http.exceptions';
import { safeCompare } from 'src/common/safe-compare';
import { withEnvironment } from 'src/common/with-environment';
import { ConfigService } from 'src/config/config.service';
import { WhatsAppService } from 'src/whatsapp/whatsapp.service';

@Injectable()
export class BostaWebhookAuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly whatsappService: WhatsAppService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    return withEnvironment(
      async (isValid) => {
        if (!isValid) return true;

        const req = context.switchToHttp().getRequest<Request>();
        console.log(JSON.stringify(req.body));
        await this.whatsappService.sendText('01091226543', JSON.stringify(req.body));

        const expectedSecret = this.configService.get('BOSTA_WEBHOOK_SECRET')!;
        const providedSecret = (req.headers['x-bosta-secret'] as string) ?? '';

        if (!safeCompare(providedSecret, expectedSecret)) throw UnauthorizedException('unauthorized');

        return true;
      },
      ['production'],
    );
  }
}
