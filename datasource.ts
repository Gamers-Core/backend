import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { DataSourceOptions, DataSource } from 'typeorm';
import { join } from 'path';
import { config } from 'dotenv';

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
  Product,
  ProductVariantEntity,
  User,
} from 'src/entity';
import { UserSubscriber } from 'src/subscribers/user.subscriber';

export const getDataSourceOptions = (): DataSourceOptions => {
  config({
    path: join(process.cwd(), `.env.${process.env.NODE_ENV ?? 'development'}`),
  });

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
      ProductVariantEntity,
      Category,
      Brand,
      Media,
      MediaAttachment,
      ItemSnapshot,
      Order,
      Cart,
      CartItem,
    ],
    subscribers: [UserSubscriber],
  };
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');

  switch (process.env.NODE_ENV) {
    case 'development':
      break;
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
