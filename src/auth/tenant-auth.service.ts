import { Injectable, UnauthorizedException, Inject, Scope } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginTenantUserDto } from './dto/login-tenant-user.dto';
import { UsersService } from '../tenant-aware/users/users.service';
import { TenantsService } from '../admin/tenants/tenants.service';
import { REQUEST, ModuleRef } from '@nestjs/core';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';

@Injectable({ scope: Scope.REQUEST })
export class TenantAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly tenantsService: TenantsService,
    @Inject(REQUEST) private readonly request: Request & { tenantId?: string },
  ) {}

  async login(loginTenantUserDto: LoginTenantUserDto, slug: string) {
    const { email, password } = loginTenantUserDto;

    // Find tenant by slug using the dedicated method
    const tenant = await this.tenantsService.findOneBySlug(slug);
    if (!tenant) {
      throw new UnauthorizedException(`Tenant with slug "${slug}" not found`);
    }

    // Set tenantId in request scope for UsersService
    this.request.tenantId = tenant.id;

    // Validate tenant credentials using UsersService
    const user = await this.usersService.findOneByEmail(email);
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Payload includes necessary info, respecting tenant context
    const payload = { email: user.email, sub: user.id, tenantId: tenant.id, role: 'tenant_user' };
    return {
      accessToken: this.jwtService.sign(payload, { secret: process.env.TENANT_JWT_SECRET }),
    };
  }
}
