import { TypeOrmModule } from '@nestjs/typeorm';
import { MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import cookieSession from 'cookie-session';

import { getDataSourceOptions } from 'datasource';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { AuthGuard } from './guards';
import { RedisModule } from './redis';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    RedisModule,
    TypeOrmModule.forRoot(getDataSourceOptions()),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV ?? 'development'}`,
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({ whitelist: true }),
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {
  constructor(private configService: ConfigService) {}

  configure(consumer: MiddlewareConsumer) {
    const cookieKey = this.configService.get<string>('COOKIE_KEY');
    if (!cookieKey) throw new Error('COOKIE_KEY is required');

    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';

    consumer
      .apply(
        cookieSession({
          keys: [cookieKey],
          httpOnly: true,
          sameSite: isProduction ? 'none' : 'lax',
          secure: isProduction,
        }),
      )
      .forRoutes('*');
  }
}
