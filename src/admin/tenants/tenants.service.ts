import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { BaseService } from '../../shared/services/base.service';

@Injectable()
export class TenantsService extends BaseService<Tenant> {
  constructor(
    @InjectRepository(Tenant, 'admin')
    repository: Repository<Tenant>,
  ) {
    super(repository);
  }

  create(dto: CreateTenantDto): Promise<Tenant> {
    // Link to existing Database by id via base create
    return super.create({
      name: dto.name,
      status: dto.status,
      database: { id: dto.databaseId } as any,
    });
  }

  findAll(): Promise<Tenant[]> {
    return this.repository.find({ relations: ['database'] });
  }

  async findOne(id: string): Promise<Tenant> {
    const tenant = await this.repository.findOne({ where: { id }, relations: ['database'] });
    if (!tenant) {
      throw new NotFoundException(`Tenant with id ${id} not found`);
    }
    return tenant;
  }

  async update(id: string, dto: UpdateTenantDto): Promise<Tenant> {
    return super.update(id, dto) as Promise<Tenant>;
  }

  async remove(id: string): Promise<void> {
    const result = await this.repository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Tenant with id ${id} not found`);
    }
  }
}
