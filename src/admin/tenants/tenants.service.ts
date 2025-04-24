import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { BaseService } from '../../shared/services/base.service';
import { User } from '../../tenant-aware/users/entities/user.entity';
import { CreateUserDto } from '../../tenant-aware/users/dto/create-user.dto';
import { ConnectionProviderService } from '../../shared/services/connection-provider.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TenantsService extends BaseService<Tenant> {
  private readonly logger = new Logger(TenantsService.name);

  constructor(
    @InjectRepository(Tenant)
    repository: Repository<Tenant>,
    private readonly dataSource: DataSource,
    private readonly connectionProviderService: ConnectionProviderService,
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
    this.logger.log(`Creating initial user for tenant ${tenantId}`);
    
    try {
      // Get the tenant database connection using ConnectionProviderService
      const tenantConnection = await this.connectionProviderService.getConnection(tenantId);
      
      // Create a transaction using the tenant connection
      await tenantConnection.transaction(async (transactionalEntityManager: EntityManager) => {
        // Get a repository for the User entity within the tenant's database
        const userRepository = transactionalEntityManager.getRepository(User);
        
        // Hash the password - using the same approach as UsersService
        const salt = await bcrypt.genSalt(10); // Explicitly set salt rounds to 10 (bcrypt default)
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        
        // Create user entity with tenant ID and hashed password
        const user = userRepository.create({
          ...userData,
          password: hashedPassword,
          tenantId, // Set the tenant ID explicitly
        });
        
        // Save the user in the tenant's database
        this.logger.log('Saving initial user to tenant database');
        await userRepository.save(user);
      });
      
      this.logger.log(`Initial user for tenant ${tenantId} created successfully`);
    } catch (error) {
      this.logger.error(`Failed to create initial user for tenant ${tenantId}: ${error.message}`, error.stack);
      throw error;
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
