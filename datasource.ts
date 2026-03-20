import { DataSourceOptions, DataSource } from 'typeorm';
import { join } from 'path';
import { config } from 'dotenv';

import {
  Address,
  Category,
  Collection,
  Media,
  MediaAttachment,
  Product,
  ProductOptionEntity,
  ProductVariantEntity,
  User,
} from 'src/entity';

export const getDataSourceOptions = (): DataSourceOptions => {
  config({
    path: join(process.cwd(), `.env.${process.env.NODE_ENV ?? 'development'}`),
  });

  const migrations = [join(__dirname, 'migrations/*.{ts,js}')];

  const dataSourceOptions: Partial<DataSourceOptions> = {
    synchronize: false,
    migrations,
    entities: [
      User,
      Address,
      Product,
      ProductOptionEntity,
      ProductVariantEntity,
      Category,
      Collection,
      Media,
      MediaAttachment,
    ],
  };

  switch (process.env.NODE_ENV) {
    case 'development':
      Object.assign(dataSourceOptions, {
        type: 'sqlite',
        database: 'db.sqlite',
        synchronize: true,
      });
      break;
    // TODO: add staging and production configs
    case 'staging':
      break;
    case 'production':
      break;
    default:
      throw new Error('Unknown environment');
  }

  return dataSourceOptions as DataSourceOptions;
};

const dataSource = new DataSource(getDataSourceOptions());

export default dataSource;
