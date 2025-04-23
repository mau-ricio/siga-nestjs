import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
config();

// Admin migrations data source
const adminDataSource = new DataSource({
  ...(process.env.NODE_ENV === 'production'
    ? {
        type: process.env.ADMINDBTYPE as any,
        url: process.env.ADMINDBURL,
      }
    : {
        type: 'sqlite' as const,
        database: path.resolve(process.cwd(), 'admin.sqlite'),
      }),
  entities: [path.join(__dirname, './dist/admin/**/*.entity.js'), path.join(__dirname, './src/admin/**/*.entity.ts')],
  migrations: [path.join(__dirname, './dist/database/migrations/admin/*.js'), path.join(__dirname, './src/database/migrations/admin/*.ts')],
  synchronize: false,
  logging: true,
});

export default adminDataSource;
