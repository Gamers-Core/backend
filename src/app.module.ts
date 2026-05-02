import { MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import cookieSession from 'cookie-session';
import { getDataSourceOptions } from 'datasource';

import { AddressesModule } from './addresses/addresses.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BrandsModule } from './brands/brands.module';
import { AppCacheModule } from './cache/cache.module';
import { CartModule } from './cart/cart.module';
import { CategoriesModule } from './categories/categories.module';
import { ValidationException } from './common/exceptions';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { getEnvironment } from './config/helpers';
import { validate } from './config/validate';
import { FAQsModule } from './faqs/faqs.module';
import { FeaturedVariantsModule } from './featured-variants/featured-variants.module';
import { AuthGuard } from './guards/auth.guard';
import { I18nModule } from './i18n/i18n.module';
import { LocaleContextMiddleware } from './i18n/locale-context.middleware';
import { MediaModule } from './media/media.module';
import { OrdersModule } from './orders/orders.module';
import { PoliciesModule } from './policies/policies.module';
import { ProductsModule } from './products/products.module';
import { RedisModule } from './redis/redis.module';
import { UserReviewsModule } from './user-reviews/user-reviews.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${getEnvironment()}`,
      validate,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get('DATABASE_URL');

        const environment = configService.environment;
        const isLocal = environment === 'local';

        return getDataSourceOptions(databaseUrl, !isLocal);
      },
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
