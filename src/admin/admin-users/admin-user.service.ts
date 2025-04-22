import { Injectable } from '@nestjs/common';
import { AdminUser } from './admin-user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminUserService {
  constructor(
    @InjectRepository(AdminUser)
    private readonly repository: Repository<AdminUser>,
  ) {}

  async findAll(): Promise<AdminUser[]> {
    return this.repository.find();
  }

  async findOne(id: string): Promise<AdminUser | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findOneByEmail(email: string): Promise<AdminUser | null> {
    return this.repository.findOne({ where: { email } });
  }

  async create(dto: CreateAdminUserDto): Promise<AdminUser> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(dto.password, salt);
    const user = this.repository.create({ ...dto, password: hashedPassword });
    return this.repository.save(user);
  }

  async update(id: string, dto: UpdateAdminUserDto): Promise<AdminUser | null> {
    if (dto.password) {
      const salt = await bcrypt.genSalt();
      dto.password = await bcrypt.hash(dto.password, salt);
    }
    await this.repository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }
}
