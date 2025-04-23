import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Database } from './entities/database.entity';
import { CreateDatabaseDto } from './dto/create-database.dto';
import { UpdateDatabaseDto } from './dto/update-database.dto';
import { BaseService } from '../../shared/services/base.service';

@Injectable()
export class DatabasesService extends BaseService<Database> {
  constructor(
    @InjectRepository(Database)
    repository: Repository<Database>,
  ) {
    super(repository);
  }

  // Override to keep strong DTO typing
  create(dto: CreateDatabaseDto): Promise<Database> {
    return super.create(dto);
  }

  async update(id: string, dto: UpdateDatabaseDto): Promise<Database | null> {
    return super.update(id, dto);
  }
}