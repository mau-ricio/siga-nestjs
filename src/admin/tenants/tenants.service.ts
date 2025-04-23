import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { BaseService } from '../../shared/services/base.service';
import { User } from '../../tenant-aware/users/entities/user.entity';
import { CreateUserDto } from '../../tenant-aware/users/dto/create-user.dto';

@Injectable()
export class TenantsService extends BaseService<Tenant> {
  constructor(
    @InjectRepository(Tenant)
    repository: Repository<Tenant>,
    private readonly dataSource: DataSource,
  ) {
    super(repository);
  }

  async create(dto: CreateTenantDto): Promise<Tenant> {
    // Link to existing Database by id via base create
    const tenant = await super.create({
      name: dto.name,
      slug: dto.slug,
      externalId: dto.externalId,
      status: dto.status,
      database: { id: dto.databaseId } as any,
    });

    // If initialUser data is provided, create the first user for this tenant
    if (dto.initialUser) {
      await this.createInitialUser(tenant.id, dto.initialUser);
    }

    return tenant;
  }

  async createInitialUser(tenantId: string, userData: CreateUserDto): Promise<void> {
    // Create a tenant-context query runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    
    try {
      // Start transaction
      await queryRunner.startTransaction();
      
      // Create the user directly using the entity manager with tenantId set
      const userRepository = queryRunner.manager.getRepository(User);
      
      // Create user entity with tenant ID
      const user = userRepository.create({
        ...userData,
        tenantId, // Set the tenant ID explicitly
      });
      
      // Save the user in the context of the transaction
      await userRepository.save(user);
      
      // Commit the transaction
      await queryRunner.commitTransaction();
    } catch (error) {
      // Rollback transaction if there's an error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
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

  async findOneBySlug(slug: string): Promise<Tenant | null> {
    const tenant = await this.repository.findOne({ where: { slug } });
    if (!tenant) {
      return null;
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
