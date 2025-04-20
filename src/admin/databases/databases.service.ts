import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Database } from './entities/database.entity';
import { CreateDatabaseDto } from './dto/create-database.dto';
import { UpdateDatabaseDto } from './dto/update-database.dto';

@Injectable()
export class DatabasesService {
  constructor(
    @InjectRepository(Database, 'admin')
    private readonly repository: Repository<Database>,
  ) {}

  create(dto: CreateDatabaseDto): Promise<Database> {
    const entity = this.repository.create(dto);
    return this.repository.save(entity);
  }

  findAll(): Promise<Database[]> {
    return this.repository.find();
  }

  findOne(id: string): Promise<Database | null> {
    return this.repository.findOneBy({ id });
  }

  async update(id: string, dto: UpdateDatabaseDto): Promise<Database | null> {
    await this.repository.update(id, dto);
    return this.findOne(id);
  }

  remove(id: string): Promise<void> {
    return this.repository.delete(id).then(() => undefined);
  }
}