import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection, createConnection } from 'typeorm';
import * as path from 'path';
import { Tenant } from '../../admin/tenants/entities/tenant.entity';

@Injectable()
export class ConnectionProviderService {
  private readonly logger = new Logger(ConnectionProviderService.name);
  private readonly connections: Map<string, Connection> = new Map();

  constructor(
    @InjectRepository(Tenant, 'admin')
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

    // Create a new connection for this tenant
    const connection = await createConnection({
      name: tenantId,
      type: dbConfig.type as any,
      url: dbConfig.url,
      entities: [path.join(__dirname, '..', '..', '**', 'entities', '*.entity{.ts,.js}')],
      synchronize: true,
    });
    this.logger.log(`Established new connection for tenant ${tenantId}`);

    // Cache and return
    this.connections.set(tenantId, connection);
    return connection;
  }
}
