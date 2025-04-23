import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
config();

// Admin migrations configuration
const adminMigrationDataSourceOptions: DataSourceOptions = {
  ...(process.env.NODE_ENV === 'production'
    ? {
        type: process.env.ADMINDBTYPE as any,
        url: process.env.ADMINDBURL,
      }
    : {
        type: 'sqlite' as const,
        database: path.resolve(process.cwd(), 'admin.sqlite'),
      }),
  entities: [path.join(__dirname, '../admin/**/*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, '../database/migrations/admin/*{.ts,.js}')],
  synchronize: false,
  logging: true,
};

// Create a DataSource instance for admin migrations
export const adminDataSource = new DataSource(adminMigrationDataSourceOptions);

// Function to create tenant migration DataSource
export const createTenantDataSource = (connectionOptions: DataSourceOptions): DataSource => {
  return new DataSource({
    ...connectionOptions,
    entities: [path.join(__dirname, '../tenant-aware/**/*.entity{.ts,.js}')],
    migrations: [path.join(__dirname, '../database/migrations/tenant/*{.ts,.js}')],
    synchronize: false,
    logging: true,
  });
};
