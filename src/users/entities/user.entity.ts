// tenantId já foi incluído automaticamente pelo TenantBase
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { TenantEntity } from '../../shared/decorators/tenant-entity.decorator';
import { TenantBase } from '../../shared/entities/tenant-base.entity';

@TenantEntity()
@Entity('users')
export class User extends TenantBase {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;
}
