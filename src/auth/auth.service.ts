import { Injectable, UnauthorizedException, Inject, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginAdminUserDto } from './dto/login-admin-user.dto';
import { LoginTenantUserDto } from './dto/login-tenant-user.dto';
import { AdminUserService } from '../admin/admin-users/admin-user.service';
import { UsersService } from '../tenant-aware/users/users.service'; // Import UsersService
import { TenantsService } from '../admin/tenants/tenants.service'; // Import TenantsService
import * as bcrypt from 'bcrypt';
import { REQUEST } from '@nestjs/core'; // Import REQUEST
import { Request } from 'express'; // Import Request

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly adminUserService: AdminUserService,
    private readonly usersService: UsersService, // Inject UsersService
    private readonly tenantsService: TenantsService, // Inject TenantsService
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

  async tenantLogin(loginTenantUserDto: LoginTenantUserDto, slug: string) {
    const { email, password } = loginTenantUserDto;

    // Find tenant by slug using the dedicated method
    const tenant = await this.tenantsService.findOneBySlug(slug);
    if (!tenant) {
      throw new UnauthorizedException(`Tenant with slug "${slug}" not found`);
    }

    // Set tenantId in request scope for UsersService
    this.request.tenantId = tenant.id;

    // Validate tenant credentials using UsersService
    const user = await this.usersService.findOneByEmail(email); // Use findOneByEmail

    if (!user || !(await bcrypt.compare(password, user.password))) { // Assuming user entity has password
      throw new UnauthorizedException('Invalid email or password'); // Update error message
    }

    // Payload should include necessary info, respecting tenant context
    const payload = { email: user.email, sub: user.id, tenantId: tenant.id, role: 'tenant_user' }; // Use email, add sub and role
    return {
      accessToken: this.jwtService.sign(payload, { secret: process.env.TENANT_JWT_SECRET }),
    };
  }
}
