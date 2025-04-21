import { Injectable } from '@nestjs/common';
import { Repository, DeepPartial, ObjectLiteral } from 'typeorm';

/**
 * BaseService provides generic CRUD operations for admin entities.
 * Admin services can extend this class to inherit common functionality.
 */
@Injectable()
export abstract class BaseService<T extends ObjectLiteral> {
  /**
   * Constructs a BaseService.
   * @param repository The TypeORM repository for the entity.
   */
  protected constructor(protected readonly repository: Repository<T>) {}

  /**
   * Retrieves all records of the entity.
   * @returns A promise resolving to an array of entities.
   */
  async findAll(): Promise<T[]> {
    return this.repository.find();
  }

  /**
   * Retrieves a single record by its primary key.
   * @param id The primary key of the record.
   * @returns A promise resolving to the entity or null if not found.
   */
  async findOne(id: string | number): Promise<T | null> {
    return this.repository.findOneBy({ id } as any);
  }

  /**
   * Creates a new record.
   * @param data The partial data for creation.
   * @returns A promise resolving to the created entity.
   */
  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  /**
   * Updates an existing record by its primary key.
   * @param id The primary key of the record.
   * @param data The partial data for update.
   * @returns A promise resolving to the updated entity or null if not found.
   */
  async update(id: string | number, data: DeepPartial<T>): Promise<T | null> {
    await this.repository.update(id as any, data as any);
    return this.findOne(id);
  }

  /**
   * Removes a record by its primary key.
   * @param id The primary key of the record.
   * @returns A promise resolving when deletion is complete.
   */
  async remove(id: string | number): Promise<void> {
    await this.repository.delete(id as any);
  }
}
