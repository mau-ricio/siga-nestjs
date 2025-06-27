import {
  Injectable,
  UnauthorizedException,
  Inject,
  Scope,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginTenantUserDto } from './dto/login-tenant-user.dto';
import { UsersService } from '../tenant-aware/users/users.service';
import { TenantsService } from '../admin/tenants/tenants.service';
import { REQUEST, ModuleRef } from '@nestjs/core';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';
import { ConnectionProviderService } from '../shared/services/connection-provider.service';
import { User } from '../tenant-aware/users/entities/user.entity';

@Injectable({ scope: Scope.REQUEST })
export class TenantAuthService {
  private readonly logger = new Logger(TenantAuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly tenantsService: TenantsService,
    @Inject(REQUEST) private readonly request: Request & { tenantId?: string },
    private readonly connectionProviderService: ConnectionProviderService,
  ) {}

  async login(loginTenantUserDto: LoginTenantUserDto, slug: string) {
    const { email, password } = loginTenantUserDto;
    this.logger.log(
      `Attempting login for email: ${email} with tenant slug: ${slug}`,
    );

    // Find tenant by slug using the dedicated method
    const tenant = await this.tenantsService.findOneBySlug(slug);
    if (!tenant) {
      this.logger.error(`Tenant with slug "${slug}" not found`);
      throw new UnauthorizedException(`Tenant with slug "${slug}" not found`);
    }
    this.logger.log(`Found tenant: ${tenant.name} with ID: ${tenant.id}`);

    // Set tenantId in request scope for UsersService (keeping this for backward compatibility)
    this.request.tenantId = tenant.id;

    let user: User | null = null;
    try {
      // Get the tenant-specific connection
      const tenantConnection =
        await this.connectionProviderService.getConnection(tenant.id);
      this.logger.log(`Retrieved connection for tenant: ${tenant.id}`);

      // Use the tenant connection to find the user directly
      const userRepository = tenantConnection.getRepository(User);
      user = await userRepository.findOne({
        where: { tenantId: tenant.id, email },
      });
    } catch (error) {
      this.logger.error(
        `Error searching for user in tenant database: ${error.message}`,
        error.stack,
      );
      throw new UnauthorizedException('Error during authentication');
    }

    if (!user) {
      this.logger.warn(
        `No user found with email: ${email} for tenant: ${tenant.id}`,
      );
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      this.logger.warn(`Password mismatch for user: ${email}`);
      throw new UnauthorizedException('Invalid email or password');
    }

    // Payload includes necessary info, respecting tenant context
    const payload = {
      email: user.email,
      sub: user.id,
      tenantId: tenant.id,
      role: 'tenant_user',
    };
    return {
      accessToken: this.jwtService.sign(payload, {
        secret: process.env.TENANT_JWT_SECRET,
      }),
    };
  }
}
