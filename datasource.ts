// datasource.ts
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { DataSourceOptions, DataSource } from 'typeorm';
import { join } from 'path';
import { config } from 'dotenv';

import { UserSubscriber } from 'src/subscribers/user.subscriber';
import { getEnvironment } from 'src/config/helpers';
import { withEnvironment } from 'src/common/with-environment';

export const getDataSourceOptions = (url: string, isSsl: boolean): DataSourceOptions => ({
  type: 'postgres',
  url,
  synchronize: false,
  migrationsRun: true,
  namingStrategy: new SnakeNamingStrategy(),
  migrations: [join(__dirname, 'migrations/*.{ts,js}')],
  entities: [join(__dirname, 'src/**/*.entity.{ts,js}')],
  subscribers: [UserSubscriber],
  ssl: isSsl ? { rejectUnauthorized: false } : false,
});

const generateDataSourceOptions = () => {
  const environment = getEnvironment();
  config({ path: join(process.cwd(), `.env.${environment}`) });

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) throw new Error(`DATABASE_URL is required (loaded .env.${environment})`);

  return withEnvironment((isValid) => getDataSourceOptions(databaseUrl, !isValid), ['local'], environment);
};

const dataSource = new DataSource(generateDataSourceOptions());
export default dataSource;
