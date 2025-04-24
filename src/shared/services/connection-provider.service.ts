import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as path from 'path';
import * as glob from 'glob';
import { Tenant } from '../../admin/tenants/entities/tenant.entity';
import { Friend } from '../../tenant-aware/friends/entities/friend.entity';

/**
 * Dynamically loads all entities within tenant-aware/
 * Works in both .ts (dev) and .js (build) environments.
 */
function loadTenantEntities(): Function[] {
  const pattern = path.resolve(__dirname, '../../tenant-aware/**/*.entity.{ts,js}');
  const files = glob.sync(pattern);

  const entities: Function[] = [];

  for (const file of files) {
    const module = require(file);
    for (const exported of Object.values(module)) {
      if (typeof exported === 'function') {
        entities.push(exported);
      }
    }
  }

  if (entities.length === 0) {
    console.warn(`[loadTenantEntities] ⚠️ No entities loaded with pattern: ${pattern}`);
  }
  console.warn(entities);
  return entities;
}


@Injectable()
export class ConnectionProviderService {
  private readonly logger = new Logger(ConnectionProviderService.name);
  private readonly connections: Map<string, DataSource> = new Map();

  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  async getConnection(tenantId: string): Promise<DataSource> {
    if (this.connections.has(tenantId)) {
      return this.connections.get(tenantId)!;
    }

    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
      relations: ['database'],
    });
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    const dbConfig = tenant.database;
    let dbPath = dbConfig.url;

    if (dbConfig.type === 'sqlite') {
      dbPath = dbPath.replace(/^sqlite:\/\//, '');
      if (dbPath.startsWith('./') || dbPath.startsWith('../')) {
        dbPath = path.resolve(process.cwd(), dbPath);
      }
    }

    const options: DataSourceOptions = {
      type: dbConfig.type as any,
      database: dbPath,
      name: tenantId,
      // Dynamically load all tenant-aware entities
      entities: loadTenantEntities(),
      // Always synchronize for SQLite to ensure tables are created
      synchronize: dbConfig.type === 'sqlite',
      // Log which entities are being used for this connection
      migrations: process.env.NODE_ENV === 'production'
        ? [path.resolve(process.cwd(), 'dist/database/migrations/tenant/*.js')]
        : [],
      migrationsRun: process.env.NODE_ENV === 'production',
      // Enable detailed logging for all database operations during testing
      logging: ['query', 'error', 'schema'],
    };

    try {
      const dataSource = new DataSource(options);
      await dataSource.initialize();
      // Manually run migrations if not using migrationsRun option and log applied names
      if (!options.migrationsRun) {
        const executed = await dataSource.runMigrations();
        executed.forEach(mig => this.logger.debug(`Executed migration: ${mig.name}`));
      }
      this.connections.set(tenantId, dataSource);
      this.logger.log(`Initialized connection for tenant ${tenantId}`);
      return dataSource;
    } catch (error) {
      this.logger.error(`Connection error for ${tenantId}: ${error.message}`, error.stack);
      throw error;
    }
  }
}
