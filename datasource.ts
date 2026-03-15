import { DataSourceOptions, DataSource } from 'typeorm';
import { join } from 'path';
import { config } from 'dotenv';

import { Category, Collection, Media, Product, User } from 'src/entity';

export const getDataSourceOptions = (): DataSourceOptions => {
  config({
    path: join(process.cwd(), `.env.${process.env.NODE_ENV ?? 'development'}`),
  });

  const migrations = [join(__dirname, 'migrations/*.{ts,js}')];

  const dataSourceOptions: Partial<DataSourceOptions> = {
    synchronize: false,
    migrations,
    entities: [User, Product, Category, Collection, Media],
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
