import { Controller, Post, Body, Param, Query, Scope } from '@nestjs/common';
import {
  ApiBody,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AdminAuthService } from './admin-auth.service';
import { TenantAuthService } from './tenant-auth.service';
import { LoginAdminUserDto } from './dto/login-admin-user.dto';
import { LoginTenantUserDto } from './dto/login-tenant-user.dto';

@ApiTags('auth')
@Controller({ path: 'auth', scope: Scope.REQUEST })
export class AuthController {
  constructor(
    private readonly adminAuthService: AdminAuthService,
    private readonly tenantAuthService: TenantAuthService,
  ) {}

  @ApiOperation({ summary: 'Admin login' })
  @ApiBody({ type: LoginAdminUserDto })
  @ApiResponse({ status: 200, description: 'Admin login successful' })
  @Post('admin/login')
  async adminLogin(@Body() loginAdminUserDto: LoginAdminUserDto) {
    return this.adminAuthService.login(loginAdminUserDto);
  }

  @ApiOperation({ summary: 'Tenant login' })
  @ApiBody({ type: LoginTenantUserDto })
  @ApiResponse({ status: 200, description: 'Tenant login successful' })
  @ApiQuery({
    name: 'tenant_slug',
    description: 'Tenant slug identifier',
    required: true,
  })
  @Post('login')
  async tenantLogin(
    @Query('tenant_slug') slug: string,
    @Body() loginTenantUserDto: LoginTenantUserDto,
  ) {
    return this.tenantAuthService.login(loginTenantUserDto, slug);
  }
}
