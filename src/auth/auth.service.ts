import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginAdminUserDto } from './dto/login-admin-user.dto';
import { LoginTenantUserDto } from './dto/login-tenant-user.dto';
import { AdminUserService } from '../admin/admin-users/admin-user.service';
import { UsersService } from '../tenant-aware/users/users.service'; // Import UsersService
import { AdminUser } from '../admin/admin-users/admin-user.entity';
import * as bcrypt from 'bcrypt';
import { REQUEST } from '@nestjs/core'; // Import REQUEST
import { Request } from 'express'; // Import Request

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly adminUserService: AdminUserService,
    private readonly usersService: UsersService, // Inject UsersService
    @Inject(REQUEST) private readonly request: Request & { tenantId?: string }, // Inject REQUEST
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
    const { email, password, tenantId } = loginTenantUserDto; // Use email instead of username

    // Set tenantId in request scope for UsersService
    // This assumes TenantMiddleware/Interceptor has already run for other requests,
    // but for login, we get tenantId from the DTO.
    // A more robust approach might involve a dedicated way to set context for login.
    this.request.tenantId = tenantId;

    // Validate tenant credentials using UsersService
    const user = await this.usersService.findOneByEmail(email); // Use findOneByEmail

    if (!user || !(await bcrypt.compare(password, user.password))) { // Assuming user entity has password
      throw new UnauthorizedException('Invalid email or password'); // Update error message
    }

    // Payload should include necessary info, respecting tenant context
    const payload = { email: user.email, sub: user.id, tenantId: tenantId, role: 'tenant_user' }; // Use email, add sub and role
    return {
      accessToken: this.jwtService.sign(payload, { secret: process.env.TENANT_JWT_SECRET }),
    };
  }
}
