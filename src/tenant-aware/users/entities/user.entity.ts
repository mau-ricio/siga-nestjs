import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TenantBase } from '../../../shared/entities/tenant-base.entity';
import { TenantEntity } from '../../../shared/decorators/tenant-entity.decorator';

// tenantId is automatically included by TenantBase
@TenantEntity()
@Entity('users')
export class User extends TenantBase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column()
  password: string;

  @Column({ default: true })
  active: boolean;
}
