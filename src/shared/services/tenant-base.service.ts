import { Injectable, Inject, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Repository, FindOptionsWhere, DeepPartial, DataSource } from 'typeorm';
import { TenantBase } from '../entities/tenant-base.entity';

@Injectable({ scope: Scope.REQUEST })
export class TenantBaseService<T extends TenantBase & { id: string }> {
  protected readonly tenantId: string;

  constructor(
    @Inject(REQUEST) private readonly request: Request,
    protected repository: Repository<T>,
  ) {
    // Extract tenantId from middleware-injected property or header
    const fromMiddleware = (this.request as any).tenantId;
    const fromHeader = this.request.headers['x-tenant-id'] as string;
    this.tenantId = (fromMiddleware as string) || fromHeader;
    // Replace injected repository with tenant-specific repository
    const conn = (this.request as any).tenantConnection as DataSource;
    if (conn) {
      this.repository = conn.getRepository<T>(this.repository.metadata.target as any);
    }
  }

  async findAll(): Promise<T[]> {
    return this.repository.findBy({ tenantId: this.tenantId } as any);
  }

  async findOne(id: string): Promise<T | null> {
    return this.repository.findOneBy({ id, tenantId: this.tenantId } as any);
  }

  async create(data: Partial<T>): Promise<T> {
    Object.assign(data, { tenantId: this.tenantId });
    const entity = this.repository.create(data as T);
    return this.repository.save(entity);
  }

  async update(id: string, data: DeepPartial<T>): Promise<T | null> {
    // cast predicate and data to any to work around TS generics
    await this.repository.update({ id, tenantId: this.tenantId } as any, data as any);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.repository.delete({ id, tenantId: this.tenantId } as any);
  }
}
