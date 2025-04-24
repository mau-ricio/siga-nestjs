import { Injectable, Inject, Scope, Logger, OnModuleInit } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { DataSource, EntityTarget, DeepPartial } from 'typeorm';
import { TenantBase } from '../entities/tenant-base.entity';
import { TenantRepository } from './tenant-repository';
import { ConnectionProviderService } from './connection-provider.service';

@Injectable({ scope: Scope.REQUEST })
export class TenantBaseService<T extends TenantBase & { id: string }> implements OnModuleInit {
  protected readonly tenantId: string;
  protected repository: TenantRepository<T>;
  private readonly logger = new Logger(TenantBaseService.name);

constructor(
    @Inject(REQUEST) protected readonly request: Request,
    private readonly connectionProviderService: ConnectionProviderService,
    private readonly entity: EntityTarget<T>,
  ) {
    this.logger.log('TenantBaseService constructor entered.');

    if (!this.request) {
      this.logger.error('Request object NOT injected into TenantBaseService!');
      throw new Error('Request object not available in TenantBaseService constructor.');
    }

    // ONLY check the property set by the middleware
    const tenantIdFromMiddleware = (this.request as any).tenantId;
    this.logger.debug(`Tenant ID from middleware property: ${tenantIdFromMiddleware}`);

    if (!tenantIdFromMiddleware) {
        this.logger.error('Tenant ID was not set by middleware on the request object.');
        throw new Error('Tenant ID is missing from the request (not set by middleware).');
    }

    this.tenantId = tenantIdFromMiddleware;

    this.logger.log(`TenantBaseService determined tenantId: ${this.tenantId}`);
    
    // Repository will be initialized when needed through onModuleInit
    this.logger.log('TenantBaseService constructor finished successfully.');
  }
  
  /**
   * NestJS lifecycle hook that runs after the module is initialized.
   * Used to set up the tenant-specific repository with the correct connection.
   */
  async onModuleInit(): Promise<void> {
    this.logger.log(`Initializing repository for tenant: ${this.tenantId}`);
    try {
      // Get the tenant-specific connection from ConnectionProviderService
      const tenantConnection = await this.connectionProviderService.getConnection(this.tenantId);
      
      // Create a tenant-aware repository with the correct connection and tenant ID
      this.repository = new TenantRepository(this.entity, tenantConnection, this.tenantId);
      
      this.logger.log(`Repository successfully initialized for tenant: ${this.tenantId}`);
    } catch (error) {
      this.logger.error(`Failed to initialize repository for tenant ${this.tenantId}: ${error.message}`);
      throw new Error(`Could not initialize tenant repository: ${error.message}`);
    }
  }

  /**
   * Ensures the repository is initialized before performing any operation
   * @private
   */
  protected async ensureRepositoryInitialized(): Promise<void> {
    if (!this.repository) {
      this.logger.log(`Repository not initialized for tenant ${this.tenantId}, initializing now...`);
      await this.onModuleInit();
    }
  }

  async findAll(): Promise<T[]> {
    // Ensure repository is initialized
    await this.ensureRepositoryInitialized();
    // Rely on TenantRepository's overridden find method
    return this.repository.find();
  }

  async findOne(id: string): Promise<T | null> {
    // Ensure repository is initialized
    await this.ensureRepositoryInitialized();
    // Rely on TenantRepository's overridden findOne method
    // Need to cast id to FindOptionsWhere<T>
    return this.repository.findOne({ where: { id } as any });
  }

  async create(data: Partial<T>): Promise<T> {
    // Ensure repository is initialized
    await this.ensureRepositoryInitialized();
    // Keep adding tenantId here as TenantRepository doesn't override create/save
    Object.assign(data, { tenantId: this.tenantId });
    const entity = this.repository.create(data as T);
    return this.repository.save(entity);
  }

  async update(id: string, data: DeepPartial<T>): Promise<T | null> {
    // Ensure repository is initialized
    await this.ensureRepositoryInitialized();
    // Rely on TenantRepository's overridden update method
    // Pass only the non-tenant part of the criteria
    await this.repository.update({ id } as any, data as any);
    // findOne will also use the tenant-aware repository
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    // Ensure repository is initialized
    await this.ensureRepositoryInitialized();
    // Rely on TenantRepository's overridden delete method
    // Pass only the non-tenant part of the criteria
    await this.repository.delete({ id } as any);
  }
}
