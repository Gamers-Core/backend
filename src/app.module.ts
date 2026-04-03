import { TypeOrmModule } from '@nestjs/typeorm';
import { MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import cookieSession from 'cookie-session';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';

import { getDataSourceOptions } from 'datasource';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthGuard } from './guards';
import { AppCacheModule } from './cache';
import { RedisModule } from './redis';
import { CloudinaryModule } from './cloudinary';
import { UsersModule } from './users';
import { AuthModule } from './auth';
import { AddressesModule } from './addresses';
import { BostaModule } from './bosta';
import { ProductsModule } from './products';
import { MediaModule } from './media';
import { OrdersModule } from './orders';
import { CartModule } from './cart';
import { GlobalExceptionFilter, ValidationException } from './common';
import { I18nModule, LocaleContextMiddleware } from './i18n';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    AddressesModule,
    BostaModule,
    AppCacheModule,
    ProductsModule,
    MediaModule,
    OrdersModule,
    CartModule,
    RedisModule,
    CloudinaryModule,
    I18nModule,
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
      useValue: new ValidationPipe({
        whitelist: true,
        exceptionFactory: (errors) => new ValidationException(errors),
      }),
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {
  constructor(
    private configService: ConfigService,
    private localeContextMiddleware: LocaleContextMiddleware,
  ) {}

  configure(consumer: MiddlewareConsumer) {
    const cookieKey = this.configService.get<string>('COOKIE_KEY');
    if (!cookieKey) throw new Error('COOKIE_KEY is required');

    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';

    consumer
      .apply(
        cookieSession({
          keys: [cookieKey],
          httpOnly: true,
          sameSite: isProduction ? 'none' : 'lax',
          secure: isProduction,
          maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        }),
        this.localeContextMiddleware.use.bind(this.localeContextMiddleware),
      )
      .forRoutes('*');
  }
}
