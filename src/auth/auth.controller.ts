import { Controller, Post, Body, Param } from '@nestjs/common';
import { ApiBody, ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginAdminUserDto } from './dto/login-admin-user.dto';
import { LoginTenantUserDto } from './dto/login-tenant-user.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Admin login' })
  @ApiBody({ type: LoginAdminUserDto })
  @ApiResponse({ status: 200, description: 'Admin login successful' })
  @Post('admin/login')
  async adminLogin(@Body() loginAdminUserDto: LoginAdminUserDto) {
    return this.authService.adminLogin(loginAdminUserDto);
  }

  @ApiOperation({ summary: 'Tenant login' })
  @ApiBody({ type: LoginTenantUserDto })
  @ApiResponse({ status: 200, description: 'Tenant login successful' })
  @ApiParam({ name: 'slug', description: 'Tenant slug identifier' })
  @Post('tenant/:slug/login')
  async tenantLogin(
    @Param('slug') slug: string,
    @Body() loginTenantUserDto: LoginTenantUserDto
  ) {
    return this.authService.tenantLogin(loginTenantUserDto, slug);
  }
}
