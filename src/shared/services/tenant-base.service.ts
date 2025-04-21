import { Injectable, Inject, Scope, Logger } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { DataSource, EntityTarget, DeepPartial } from 'typeorm';
import { TenantBase } from '../entities/tenant-base.entity';
import { TenantRepository } from './tenant-repository';

@Injectable({ scope: Scope.REQUEST })
export class TenantBaseService<T extends TenantBase & { id: string }> {
  protected readonly tenantId: string;
  protected repository: TenantRepository<T>;
  private readonly logger = new Logger(TenantBaseService.name);

constructor(
    @Inject(REQUEST) protected readonly request: Request,
    dataSource: DataSource,
    entity: EntityTarget<T>,
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
    this.repository = new TenantRepository(entity, dataSource, this.tenantId);
    this.logger.log('TenantBaseService constructor finished successfully.');
  }

  async findAll(): Promise<T[]> {
    // Rely on TenantRepository's overridden find method
    return this.repository.find();
  }

  async findOne(id: string): Promise<T | null> {
    // Rely on TenantRepository's overridden findOne method
    // Need to cast id to FindOptionsWhere<T>
    return this.repository.findOne({ where: { id } as any });
  }

  async create(data: Partial<T>): Promise<T> {
    // Keep adding tenantId here as TenantRepository doesn't override create/save
    Object.assign(data, { tenantId: this.tenantId });
    const entity = this.repository.create(data as T);
    return this.repository.save(entity);
  }

  async update(id: string, data: DeepPartial<T>): Promise<T | null> {
    // Rely on TenantRepository's overridden update method
    // Pass only the non-tenant part of the criteria
    await this.repository.update({ id } as any, data as any);
    // findOne will also use the tenant-aware repository
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    // Rely on TenantRepository's overridden delete method
    // Pass only the non-tenant part of the criteria
    await this.repository.delete({ id } as any);
  }
}
