import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection, createConnection, ConnectionOptions } from 'typeorm';
import * as path from 'path';
import { Tenant } from '../../admin/tenants/entities/tenant.entity';

@Injectable()
export class ConnectionProviderService {
  private readonly logger = new Logger(ConnectionProviderService.name);
  private readonly connections: Map<string, Connection> = new Map();

  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  async getConnection(tenantId: string): Promise<Connection> {
    // Return cached if exists
    if (this.connections.has(tenantId)) {
      return this.connections.get(tenantId) as Connection;
    }

    // Load tenant and its database config
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
      relations: ['database'],
    });
    if (!tenant) {
      throw new Error(`Tenant with ID ${tenantId} not found`);
    }
    const dbConfig = tenant.database;
    this.logger.debug(`Database type: ${dbConfig.type}`);
    this.logger.debug(`Database connection string: ${dbConfig.url}`);

    // Base connection options
    const baseOptions: Partial<ConnectionOptions> = {
        name: tenantId,
        type: dbConfig.type as any, // Cast needed as type comes from DB
        // Only include tenant-aware entities, not admin entities
        entities: [__dirname + '/tenant-aware/**/*.entity{.ts,.js}'],
        synchronize: true, // Consider disabling synchronize in production
    };

    // Specific options based on type
    let connectionOptions: ConnectionOptions;
    if (dbConfig.type === 'sqlite') {
        // For SQLite, extract the path from the URL
        const dbPath = dbConfig.url.replace(/^sqlite:\/\//, '');
        this.logger.debug(`SQLite database path: ${dbPath}`);
        connectionOptions = {
            ...baseOptions,
            database: dbPath, // Use 'database' property for SQLite path
        } as ConnectionOptions;
    } else {
        // For other types like PostgreSQL, use the URL directly
        connectionOptions = {
            ...baseOptions,
            url: dbConfig.url,
        } as ConnectionOptions;
    }


    // Create a new connection for this tenant
    try {
        const connection = await createConnection(connectionOptions);
        this.logger.log(`Established new connection for tenant ${tenantId}`);
        // Cache and return
        this.connections.set(tenantId, connection);
        return connection;
    } catch (error) {
        this.logger.error(`Failed to create connection for tenant ${tenantId}: ${error.message}`, error.stack);
        throw error; // Re-throw the error after logging
    }
  }
}