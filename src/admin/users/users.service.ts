import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { BaseService } from '../shared/services/base.service';

@Injectable()
export class UsersService extends BaseService<User> {
  constructor(
    @InjectRepository(User, 'admin')
    repository: Repository<User>,
  ) {
    super(repository);
  }

  // Override to preserve DTO typings
  create(dto: CreateUserDto): Promise<User> {
    return super.create(dto);
  }

  async update(id: string, dto: UpdateUserDto): Promise<User | null> {
    return super.update(id, dto);
  }
}
