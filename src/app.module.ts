import { MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import cookieSession from 'cookie-session';
import { getDataSourceOptions } from 'datasource';

import { AddressesModule } from './addresses/addresses.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/guards/auth.guard';
import { BrandsModule } from './brands/brands.module';
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
import { I18nModule } from './i18n/i18n.module';
import { LocaleContextMiddleware } from './i18n/locale-context.middleware';
import { MediaModule } from './media/media.module';
import { OrdersModule } from './orders/orders.module';
import { PoliciesModule } from './policies/policies.module';
import { ProductsModule } from './products/products.module';
import { CacheModule } from './redis/cache.module';
import { RedisModule } from './redis/redis.module';
import { MaintenanceGuard } from './settings/guards/maintenance.guard';
import { SettingsModule } from './settings/settings.module';
import { SidebarModule } from './sidebar/sidebar.module';
import { UserReviewsModule } from './user-reviews/user-reviews.module';
import { UsersModule } from './users/users.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
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
    PoliciesModule,
    ConfigModule,
    BrandsModule,
    OrdersModule,
    RedisModule,
    CacheModule,
    UsersModule,
    MediaModule,
    AuthModule,
    CartModule,
    I18nModule,
    FAQsModule,
    SidebarModule,
    WhatsappModule,
    SettingsModule,
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
    {
      provide: APP_GUARD,
      useClass: MaintenanceGuard,
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
