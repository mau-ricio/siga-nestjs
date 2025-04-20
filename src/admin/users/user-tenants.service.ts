import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserTenant } from './entities/user-tenant.entity';
import { CreateUserTenantDto } from './dto/create-user-tenant.dto';
import { UpdateUserTenantDto } from './dto/update-user-tenant.dto';
import { User } from './entities/user.entity';
import { Tenant } from '../tenants/entities/tenant.entity';

@Injectable()
export class UserTenantsService {
  constructor(
    @InjectRepository(UserTenant, 'admin')
    private readonly repository: Repository<UserTenant>,
  ) {}

  create(userId: string, dto: CreateUserTenantDto): Promise<UserTenant> {
    const userTenant = this.repository.create({
      ...dto,
      user: { id: userId } as User,
      tenant: { id: dto.tenantId } as Tenant,
    });
    return this.repository.save(userTenant);
  }

  findAll(userId: string): Promise<UserTenant[]> {
    return this.repository.find({
      where: { user: { id: userId } },
      relations: ['tenant'],
    });
  }

  async findOne(userId: string, id: string): Promise<UserTenant> {
    const userTenant = await this.repository.findOne({
      where: { id, user: { id: userId } },
      relations: ['tenant'],
    });
    if (!userTenant) {
      throw new NotFoundException(`UserTenant with id ${id} for user ${userId} not found`);
    }
    return userTenant;
  }

  async update(userId: string, id: string, dto: UpdateUserTenantDto): Promise<UserTenant> {
    const existing = await this.findOne(userId, id);
    const merged = this.repository.merge(existing, dto);
    return this.repository.save(merged);
  }

  async remove(userId: string, id: string): Promise<void> {
    const result = await this.repository.delete({ id, user: { id: userId } });
    if (result.affected === 0) {
      throw new NotFoundException(`UserTenant with id ${id} for user ${userId} not found`);
    }
  }
}
