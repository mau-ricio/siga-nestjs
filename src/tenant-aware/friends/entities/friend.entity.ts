// tenantId is automatically included by TenantBase
import { Column, PrimaryGeneratedColumn } from 'typeorm';
import { TenantBase } from '../../../shared/entities/tenant-base.entity';
import { TenantEntity } from '../../../shared/decorators/tenant-entity.decorator';

@TenantEntity({ name: 'friends' })
export class Friend extends TenantBase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true, length: 100 })
  preferredDrink?: string;
}
