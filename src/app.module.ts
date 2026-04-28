import { TypeOrmModule } from '@nestjs/typeorm';
import { MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import cookieSession from 'cookie-session';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';

import { getDataSourceOptions } from 'datasource';

import { ConfigModule, ConfigService, getEnvironment, validate } from './config';
import { GlobalExceptionFilter, ValidationException } from './common';
import { I18nModule, LocaleContextMiddleware } from './i18n';
import { FeaturedVariantsModule } from './featured-variants';
import { UserReviewsModule } from './user-reviews';
import { AppController } from './app.controller';
import { CategoriesModule } from './categories';
import { AddressesModule } from './addresses';
import { ProductsModule } from './products';
import { PoliciesModule } from './policies';
import { AppService } from './app.service';
import { AppCacheModule } from './cache';
import { BrandsModule } from './brands';
import { OrdersModule } from './orders';
import { BostaModule } from './bosta';
import { RedisModule } from './redis';
import { UsersModule } from './users';
import { MediaModule } from './media';
import { AuthGuard } from './guards';
import { AuthModule } from './auth';
import { CartModule } from './cart';
import { FAQsModule } from './faqs';

@Module({
  imports: [
    TypeOrmModule.forRoot(getDataSourceOptions()),
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${getEnvironment(process.env.NODE_ENV)}`,
      validate,
    }),
    FeaturedVariantsModule,
    UserReviewsModule,
    CategoriesModule,
    AddressesModule,
    ProductsModule,
    AppCacheModule,
    PoliciesModule,
    ConfigModule,
    BrandsModule,
    OrdersModule,
    RedisModule,
    UsersModule,
    BostaModule,
    MediaModule,
    AuthModule,
    CartModule,
    I18nModule,
    FAQsModule,
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
    const cookieKey = this.configService.get('COOKIE_KEY');

    const isLocal = this.configService.environment === 'local';
    const cookieDomain = this.configService.get('COOKIE_DOMAIN');

    consumer
      .apply(
        cookieSession({
          keys: [cookieKey],
          httpOnly: true,
          sameSite: isLocal ? 'lax' : 'none',
          secure: !isLocal,
          domain: cookieDomain,
          path: '/',
          maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        }),
        this.localeContextMiddleware.use.bind(this.localeContextMiddleware),
      )
      .forRoutes('*');
  }
}
