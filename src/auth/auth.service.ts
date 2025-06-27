import {
  Injectable,
  UnauthorizedException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginAdminUserDto } from './dto/login-admin-user.dto';
import { LoginTenantUserDto } from './dto/login-tenant-user.dto';
import { AdminUserService } from '../admin/admin-users/admin-user.service';
import { UsersService } from '../tenant-aware/users/users.service'; // Import UsersService
import { TenantsService } from '../admin/tenants/tenants.service'; // Import TenantsService
import * as bcrypt from 'bcrypt';
import { REQUEST } from '@nestjs/core'; // Import REQUEST
import { Request } from 'express'; // Import Request
import { ModuleRef } from '@nestjs/core'; // Import ModuleRef for lazy loading

@Injectable()
export class AuthService {
  private usersService: UsersService;

  constructor(
    private readonly jwtService: JwtService,
    private readonly adminUserService: AdminUserService,
    private readonly tenantsService: TenantsService,
    private readonly moduleRef: ModuleRef, // Inject ModuleRef for lazy loading
    @Inject(REQUEST) private readonly request: Request & { tenantId?: string },
  ) {}

  async adminLogin(loginAdminUserDto: LoginAdminUserDto) {
    const { email, password } = loginAdminUserDto;

    // Validate admin credentials
    const adminUser = await this.adminUserService.findOneByEmail(email);
    // Use bcrypt.compare for password validation
    if (!adminUser || !(await bcrypt.compare(password, adminUser.password))) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const payload = {
      username: adminUser.username,
      sub: adminUser.id,
      role: 'admin',
    }; // Include user ID (sub) in payload
    return {
      accessToken: this.jwtService.sign(payload, {
        secret: process.env.ADMIN_JWT_SECRET,
      }),
    };
  }

  // Lazy load the UsersService only when needed
  private async getUsersService(): Promise<UsersService> {
    if (!this.usersService) {
      // Pass the current request context to properly resolve the REQUEST-scoped service
      this.usersService = await this.moduleRef.resolve(
        UsersService,
        undefined,
        { strict: false },
      );
    }
    return this.usersService;
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

    // Validate tenant credentials using lazy loaded UsersService
    const usersService = await this.getUsersService();
    const user = await usersService.findOneByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      // Assuming user entity has password
      throw new UnauthorizedException('Invalid email or password'); // Update error message
    }

    // Payload should include necessary info, respecting tenant context
    const payload = {
      email: user.email,
      sub: user.id,
      tenantId: tenant.id,
      role: 'tenant_user',
    }; // Use email, add sub and role
    return {
      accessToken: this.jwtService.sign(payload, {
        secret: process.env.TENANT_JWT_SECRET,
      }),
    };
  }
}
