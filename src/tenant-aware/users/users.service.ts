import { Injectable, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantBaseService } from '../../shared/services/tenant-base.service';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService extends TenantBaseService<User> {
  constructor(
    @InjectRepository(User)
    userRepository: Repository<User>,
    @Inject(REQUEST) request: any,
  ) {
    super(request, userRepository);
  }
}
