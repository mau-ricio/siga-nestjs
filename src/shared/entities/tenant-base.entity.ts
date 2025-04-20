import { Column } from 'typeorm';

export abstract class TenantBase {
  @Column({ type: 'varchar', nullable: false })
  tenantId: string;
}
