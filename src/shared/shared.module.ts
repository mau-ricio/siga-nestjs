import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConnectionProviderService } from './services/connection-provider.service';
import { Tenant } from '../admin/tenants/entities/tenant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant], 'admin')],
  providers: [ConnectionProviderService],
  exports: [ConnectionProviderService],
})
export class SharedModule {}
