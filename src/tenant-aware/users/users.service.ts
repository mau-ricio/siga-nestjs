import { Injectable, Inject, Scope, Logger } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { TenantBaseService } from '../../shared/services/tenant-base.service';
import { User } from './entities/user.entity';

@Injectable({ scope: Scope.REQUEST })
export class UsersService extends TenantBaseService<User> {
  private readonly logger2 = new Logger(UsersService.name); // Logger initialized here

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @Inject(REQUEST) request: any,
  ) {
    // Call super() first
    try {
      super(request, dataSource, User);
      // Log AFTER successful super() call
      this.logger2.log('UsersService constructor finished super() call successfully.');
    } catch (error) {
      // Log error from super() - Logger might not be available if super failed early
      // Use console.error as a fallback if logger isn't ready
      //this.logger2.error('Error during super() call in UsersService constructor:', error.stack);
      throw error; // Re-throw the error
    }
    // Log entry after super() has potentially finished or thrown
    this.logger2.log('UsersService constructor finished.');
  }

  async findByName(name: string): Promise<User | null> {
    // ... existing findByName method ...
    this.logger2.log(`findByName called with name: ${name}`);
    if (!this.repository) {
        this.logger2.warn('Repository not available in findByName');
        return null;
    }
    return this.repository.findOne({ where: { name } });
  }
}