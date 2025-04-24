// filepath: /home/mauricio/dev/siga-nestjs/src/shared/shared.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { ConnectionProviderService } from './services/connection-provider.service';
import { TenantMiddleware } from './middlewares/tenant.middleware';
import { TenantInterceptor } from './interceptors/tenant.interceptor';
import { ConfigModule } from '@nestjs/config';
import { TenantsModule } from '../admin/tenants/tenants.module';
import { AuthModule } from '../auth/auth.module'; // Import AuthModule

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => TenantsModule), // Use forwardRef to avoid circular dependency
    AuthModule, // Add AuthModule here
  ],
  providers: [ConnectionProviderService, TenantMiddleware, TenantInterceptor],
  exports: [ConnectionProviderService, TenantMiddleware, TenantInterceptor],
})
export class SharedModule {}
