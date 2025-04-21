import { Repository, DataSource, EntityTarget, DeepPartial, FindOptionsWhere } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { TenantBase } from '../entities/tenant-base.entity';

export class TenantRepository<T extends TenantBase> extends Repository<T> {
  private tenantId: string;

  constructor(entity: EntityTarget<T>, dataSource: DataSource, tenantId: string) {
    super(entity, dataSource.createEntityManager());
    this.tenantId = tenantId;
  }

  // Override find method to enforce tenant filtering
  async find(options?: any): Promise<T[]> {
    options = options || {};
    options.where = { ...options.where, tenantId: this.tenantId };
    return super.find(options);
  }

  // Override findOne method to enforce tenant filtering
  async findOne(options: any): Promise<T | null> {
    options = options || {};
    options.where = { ...options.where, tenantId: this.tenantId };
    return super.findOne(options);
  }

  // Override update method to enforce tenant filtering
  async update(
    criteria: FindOptionsWhere<T>,
    partialEntity: QueryDeepPartialEntity<T>,
  ): Promise<any> {
    const tenantCriteria = { ...criteria, tenantId: this.tenantId };
    return super.update(tenantCriteria, partialEntity);
  }

  // Override delete method to enforce tenant filtering
  async delete(criteria: FindOptionsWhere<T>): Promise<any> {
    const tenantCriteria = { ...criteria, tenantId: this.tenantId };
    return super.delete(tenantCriteria as any);
  }
}
