import { Module } from '@nestjs/common';
import { AdminAuthController } from './admin-auth.controller';
import { TenantAuthController } from './tenant-auth.controller';
import { AdminAuthService } from './admin-auth.service';
import { TenantAuthService } from './tenant-auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AdminJwtStrategy } from './strategies/admin-jwt.strategy';
import { TenantJwtStrategy } from './strategies/tenant-jwt.strategy';
import { AdminUserModule } from '../admin/admin-users/admin-user.module';
import { UsersModule } from '../tenant-aware/users/users.module';
import { TenantsModule } from '../admin/tenants/tenants.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('TENANT_JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
    AdminUserModule,
    UsersModule, // Only needed for TenantAuthService
    TenantsModule,
    ConfigModule,
  ],
  controllers: [AdminAuthController, TenantAuthController],
  providers: [AdminAuthService, TenantAuthService, AdminJwtStrategy, TenantJwtStrategy],
  // Export services and modules that might be needed elsewhere
  exports: [AdminAuthService, TenantAuthService, PassportModule, JwtModule],
})
export class AuthModule {}