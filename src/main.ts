import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  const cookieDomain = process.env.COOKIE_DOMAIN;

  const origin = cookieDomain
    ? new RegExp(`^https?:\\/\\/([a-z0-9-]+\\.)*${cookieDomain.replace(/^\./, '').replace(/\./g, '\\.')}$`)
    : new RegExp('^https?://localhost(:[0-9]+)?$');

  app.enableCors({
    origin,
    credentials: true,
    exposedHeaders: ['x-locale', 'x-is-logged-in'],
  });

  await app.listen(process.env.PORT ?? 8080);
}
void bootstrap();
