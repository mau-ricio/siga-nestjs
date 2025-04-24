import { Injectable, Scope, Inject, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantBaseService } from '../../shared/services/tenant-base.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';
import { ConnectionProviderService } from '../../shared/services/connection-provider.service';

@Injectable({ scope: Scope.REQUEST })
export class UsersService extends TenantBaseService<User> {
  constructor(
    @Inject(REQUEST) protected readonly request: Request,
    connectionProviderService: ConnectionProviderService,
    // Inject the specific repository for potential direct use if needed, though base methods use the tenant-aware one
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {
    // Pass request, connectionProviderService, and the entity itself to the base service constructor
    super(request, connectionProviderService, User);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    this.ensureRepositoryInitialized();

    // Hash the password before creating
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    const user = this.repository.createWithTenant({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.repository.save(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    const updateData: Partial<User> = { ...updateUserDto };

    // Hash the password if it's included in the update DTO
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      updateData.password = await bcrypt.hash(updateUserDto.password, salt);

    } else {
      // Ensure password is not accidentally set to null or undefined if not provided
      delete updateData.password;
    }


    if (Object.keys(updateData).length === 0) {
        // Avoid unnecessary update calls if only id was passed or password was the only field and removed
        return this.findOne(id); // Or throw an error/return null based on desired behavior
    }

    // Use the repository provided by TenantBaseService for tenant-aware update
    // The base update method handles finding the correct entity by id *and* tenantId
    await this.repository.update({ id } as any, updateData); // Pass criteria and data
    return this.findOne(id); // Fetch the updated entity
  }


  async findOneByEmail(email: string): Promise<User | null> { // Changed return type to Promise<User | null>
    await this.ensureRepositoryInitialized();
    return this.repository.findOne({ where: { email } });
  }

  // No need to override findAll, findOne (by id), remove as they are handled by TenantBaseService
  // and don't require specific password logic.
}