// filepath: src/admin/admin-users/admin-user.service.ts
// AdminUserService provides CRUD for admin users using BaseService
import { Injectable } from '@nestjs/common';
import { BaseService } from '../shared/services/base.service';
import { AdminUser } from './admin-user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AdminUserService extends BaseService<AdminUser> {
  constructor(
    @InjectRepository(AdminUser)
    repository: Repository<AdminUser>,
  ) {
    super(repository);
  }
}
