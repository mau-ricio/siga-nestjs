import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
config();

// Tenant migrations base data source - this will be used as a template
// The actual connection details will be provided by the tenant-runner.js script
const tenantDataSource = new DataSource({
  type: 'sqlite' as const, // Default type, will be overridden by tenant-runner.js
  database: ':memory:', // Default database, will be overridden by tenant-runner.js
  entities: [path.join(__dirname, './dist/tenant-aware/**/*.entity.js'), path.join(__dirname, './src/tenant-aware/**/*.entity.ts')],
  migrations: [path.join(__dirname, './dist/database/migrations/tenant/*.js'), path.join(__dirname, './src/database/migrations/tenant/*.ts')],
  synchronize: false,
  logging: true,
});

export default tenantDataSource;
