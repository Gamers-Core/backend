import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { DataSourceOptions, DataSource } from 'typeorm';
import { join } from 'path';
import { config } from 'dotenv';

import 'src/types';
import {
  Address,
  Cart,
  CartItem,
  Category,
  Brand,
  Media,
  MediaAttachment,
  ItemSnapshot,
  Order,
  OrderStatusHistory,
  Product,
  Variant,
  FeaturedVariant,
  User,
  UserReview,
  Policy,
  FAQ,
} from 'src/entity';
import { UserSubscriber } from 'src/subscribers/user.subscriber';
import { getEnvironment } from 'src/config';

export const getDataSourceOptions = (): DataSourceOptions => {
  const environment = getEnvironment(process.env.NODE_ENV);

  config({ path: join(process.cwd(), `.env.${environment}`) });

  const migrations = [join(__dirname, 'migrations/*.{ts,js}')];

  const dataSourceOptions: Partial<DataSourceOptions> = {
    synchronize: false,
    migrations,
    type: 'postgres',
    url: process.env.DATABASE_URL,
    migrationsRun: true,
    namingStrategy: new SnakeNamingStrategy(),
    entities: [
      User,
      Address,
      Product,
      Variant,
      FeaturedVariant,
      UserReview,
      FAQ,
      Category,
      Brand,
      Media,
      MediaAttachment,
      ItemSnapshot,
      Order,
      OrderStatusHistory,
      Cart,
      CartItem,
      Policy,
    ],
    subscribers: [UserSubscriber],
  };
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');

  switch (environment) {
    case 'local':
      break;
    case 'development':
    case 'staging':
    case 'production':
      Object.assign(dataSourceOptions, {
        ssl: { rejectUnauthorized: false },
      });
      break;
    default:
      throw new Error('Unknown environment');
  }

  return dataSourceOptions as DataSourceOptions;
};

const dataSource = new DataSource(getDataSourceOptions());

export default dataSource;
