import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    exposedHeaders: ['x-locale'],
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
