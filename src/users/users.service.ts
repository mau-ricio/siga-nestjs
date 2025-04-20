import { Injectable, Inject, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantBaseService } from '../shared/services/tenant-base.service';
import { User } from './entities/user.entity';

@Injectable({ scope: Scope.REQUEST })
export class UsersService extends TenantBaseService<User> {
  constructor(
    @Inject(REQUEST) request: Request,
    @InjectRepository(User) repository: Repository<User>,
  ) {
    super(request, repository);
  }
}
