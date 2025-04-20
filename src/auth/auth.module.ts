import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TenantJwtStrategy } from './strategies/tenant-jwt.strategy';
import { AdminJwtStrategy } from './strategies/admin-jwt.strategy';
import { TenantJwtAuthGuard } from './guards/tenant-jwt.guard';
import { AdminJwtAuthGuard } from './guards/admin-jwt.guard';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({}),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('TENANT_JWT_SECRET'),
        signOptions: { expiresIn: '3600s' },
      }),
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('ADMIN_JWT_SECRET'),
        signOptions: { expiresIn: '3600s' },
      }),
    }),
  ],
  providers: [TenantJwtStrategy, AdminJwtStrategy, TenantJwtAuthGuard, AdminJwtAuthGuard],
  exports: [PassportModule, TenantJwtAuthGuard, AdminJwtAuthGuard],
})
export class AuthModule {}
