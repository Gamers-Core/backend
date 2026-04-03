import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'crypto';
import { Request } from 'express';

import { Environment, UnauthorizedException } from 'src/common';

const safeCompare = (a: string, b: string): boolean => {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);

  if (bufA.length !== bufB.length) return false;

  return timingSafeEqual(bufA, bufB);
};

@Injectable()
export class BostaWebhookAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const env = this.configService.get<Environment>('NODE_ENV');
    if (env !== 'production') return true;

    const req = context.switchToHttp().getRequest<Request>();
    const expectedSecret = this.configService.getOrThrow<string>('BOSTA_WEBHOOK_SECRET');
    const providedSecret = (req.headers['x-bosta-secret'] as string) ?? '';

    if (!safeCompare(providedSecret, expectedSecret)) throw new UnauthorizedException('unauthorized');

    return true;
  }
}
