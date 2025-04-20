import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User, 'admin')
    private readonly repository: Repository<User>,
  ) {}

  create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.repository.create(createUserDto);
    return this.repository.save(user);
  }

  findAll(): Promise<User[]> {
    return this.repository.find();
  }

  findOne(id: string): Promise<User | null> {
    return this.repository.findOneBy({ id });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    await this.repository.update(id, updateUserDto);
    return this.findOne(id);
  }

  remove(id: string): Promise<void> {
    return this.repository.delete(id).then(() => undefined);
  }
}
