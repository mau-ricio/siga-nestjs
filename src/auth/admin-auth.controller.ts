import { Controller, Post, Body } from '@nestjs/common';
import { ApiBody, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AdminAuthService } from './admin-auth.service';
import { LoginAdminUserDto } from './dto/login-admin-user.dto';

@ApiTags('admin-auth')
@Controller('auth/admin')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @ApiOperation({ summary: 'Admin login' })
  @ApiBody({ type: LoginAdminUserDto })
  @ApiResponse({ status: 200, description: 'Admin login successful' })
  @Post('login')
  async adminLogin(@Body() loginAdminUserDto: LoginAdminUserDto) {
    return this.adminAuthService.login(loginAdminUserDto);
  }
}
