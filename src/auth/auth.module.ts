// filepath: /home/mauricio/dev/siga-nestjs/src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt'; // Import JwtModule
import { PassportModule } from '@nestjs/passport';
import { AdminJwtStrategy } from './strategies/admin-jwt.strategy';
import { TenantJwtStrategy } from './strategies/tenant-jwt.strategy';
import { AdminUserModule } from '../admin/admin-users/admin-user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';


@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('TENANT_JWT_SECRET'), // Assuming one secret for now
      }),
      inject: [ConfigService],
    }),
    AdminUserModule,
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AdminJwtStrategy, TenantJwtStrategy],
  // Export JwtModule along with others
  exports: [AuthService, PassportModule, JwtModule],
})
export class AuthModule {}