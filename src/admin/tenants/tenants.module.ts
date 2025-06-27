import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { Tenant } from './entities/tenant.entity';
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tenant]),
    forwardRef(() => SharedModule), // Use forwardRef to avoid circular dependency
  ],
  controllers: [TenantsController],
  providers: [TenantsService],
  // Export both the service and the TypeOrmModule feature
  exports: [TenantsService, TypeOrmModule],
})
export class TenantsModule {}
