import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TenantJwtAuthGuard } from './guards/tenant-jwt.guard';
import { AdminJwtAuthGuard } from './guards/admin-jwt.guard';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiBody({ type: LoginDto })
  @Post('login')
  async tenantLogin(@Body() loginDto: LoginDto) {
    return this.authService.tenantLogin(loginDto);
  }

  @ApiBody({ type: LoginDto })
  @Post('admin/login')
  async adminLogin(@Body() loginDto: LoginDto) {
    return this.authService.adminLogin(loginDto);
  }

  @UseGuards(TenantJwtAuthGuard)
  @Get('validate')
  async validateTenantToken(@Request() req) {
    return req.user;
  }

  @UseGuards(AdminJwtAuthGuard)
  @Get('admin/validate')
  async validateAdminToken(@Request() req) {
    return req.user;
  }
}
