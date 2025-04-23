import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
config();

// This is a special configuration used ONLY for generating tenant migrations
// It creates a temporary SQLite database to compare schema against tenant entities
const tenantMigrationGeneratorDataSource = new DataSource({
  type: 'sqlite',
  database: ':memory:', // Use in-memory SQLite for generation
  entities: [path.join(__dirname, './src/tenant-aware/**/*.entity.ts')],
  migrations: [path.join(__dirname, './src/database/migrations/tenant/*.ts')],
  synchronize: false,
  logging: true,
});

export default tenantMigrationGeneratorDataSource;
