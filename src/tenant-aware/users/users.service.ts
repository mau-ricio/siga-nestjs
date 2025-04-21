import { Injectable, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { TenantBaseService } from '../../shared/services/tenant-base.service';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService extends TenantBaseService<User> {
  constructor(
    dataSource: DataSource,
    @Inject(REQUEST) request: any,
  ) {
    super(request, dataSource, User);
  }

  async findByName(name: string): Promise<User | null> {
    return this.findOne({ name } as any); //filter by tenantId will be applied in the base service
  }
}
