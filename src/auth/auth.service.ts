import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginAdminUserDto } from './dto/login-admin-user.dto';
import { LoginTenantUserDto } from './dto/login-tenant-user.dto';
import { AdminUserService } from '../admin/admin-users/admin-user.service';
import { AdminUser } from '../admin/admin-users/admin-user.entity';
import * as bcrypt from 'bcrypt'; // Import bcrypt

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly adminUserService: AdminUserService,
  ) {}

  async adminLogin(loginAdminUserDto: LoginAdminUserDto) {
    const { username, password } = loginAdminUserDto;

    // Validate admin credentials
    const adminUser = await this.adminUserService.findOneByUsername(username);
    // Use bcrypt.compare for password validation
    if (!adminUser || !(await bcrypt.compare(password, adminUser.password))) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const payload = { username: adminUser.username, sub: adminUser.id, role: 'admin' }; // Include user ID (sub) in payload
    return {
      accessToken: this.jwtService.sign(payload, { secret: process.env.ADMIN_JWT_SECRET }),
    };
  }

  async tenantLogin(loginTenantUserDto: LoginTenantUserDto) {
    // Validate tenant credentials (mocked for now)
    const payload = { username: loginTenantUserDto.username, tenantId: loginTenantUserDto.tenantId };
    return {
      accessToken: this.jwtService.sign(payload, { secret: process.env.TENANT_JWT_SECRET }),
    };
  }
}
