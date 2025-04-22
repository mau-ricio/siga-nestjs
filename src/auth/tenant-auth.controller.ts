import { Controller, Post, Body, Query, Scope } from '@nestjs/common';
import { ApiBody, ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { TenantAuthService } from './tenant-auth.service';
import { LoginTenantUserDto } from './dto/login-tenant-user.dto';

@ApiTags('tenant-auth')
@Controller({ path: 'auth', scope: Scope.REQUEST })
export class TenantAuthController {
  constructor(
    private readonly tenantAuthService: TenantAuthService,
  ) {}

  @ApiOperation({ summary: 'Tenant login' })
  @ApiBody({ type: LoginTenantUserDto })
  @ApiResponse({ status: 200, description: 'Tenant login successful' })
  @ApiQuery({ name: 'tenant_slug', description: 'Tenant slug identifier', required: true })
  @Post('login')
  async tenantLogin(
    @Query('tenant_slug') slug: string,
    @Body() loginTenantUserDto: LoginTenantUserDto
  ) {
    return this.tenantAuthService.login(loginTenantUserDto, slug);
  }
}
