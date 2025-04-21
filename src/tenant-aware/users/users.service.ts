import { Injectable, Scope, Inject, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm'; // Import DataSource
import { TenantBaseService } from '../../shared/services/tenant-base.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { REQUEST } from '@nestjs/core'; // Import REQUEST
import { Request } from 'express'; // Import Request
import * as bcrypt from 'bcrypt'; // Import bcrypt

@Injectable({ scope: Scope.REQUEST })
export class UsersService extends TenantBaseService<User> {
  constructor(
    // Inject DataSource and REQUEST here, as they are needed by the base constructor
    @Inject(DataSource) protected readonly dataSource: DataSource,
    @Inject(REQUEST) protected readonly request: Request,
    // Inject the specific repository for potential direct use if needed, though base methods use the tenant-aware one
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {
    // Pass request, dataSource, and the entity itself to the base service constructor
    super(request, dataSource, User);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Hash the password before creating
    const saltRounds = 10; // Or get from config
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

    const user = this.repository.create({
      ...createUserDto,
      password: hashedPassword,
      // tenantId is automatically added by TenantBaseService's repository setup
    });
    // Use the repository provided by TenantBaseService
    return this.repository.save(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    const updateData: Partial<User> = { ...updateUserDto };

    // Hash the password if it's included in the update DTO
    if (updateUserDto.password) {
      const saltRounds = 10; // Or get from config
      updateData.password = await bcrypt.hash(updateUserDto.password, saltRounds);
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
    // Use the repository provided by TenantBaseService for tenant-aware find
    return this.repository.findOne({ where: { email } });
  }

  // No need to override findAll, findOne (by id), remove as they are handled by TenantBaseService
  // and don't require specific password logic.
}