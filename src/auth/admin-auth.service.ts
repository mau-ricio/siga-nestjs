import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginAdminUserDto } from './dto/login-admin-user.dto';
import { AdminUserService } from '../admin/admin-users/admin-user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly adminUserService: AdminUserService,
  ) {}

  async login(loginAdminUserDto: LoginAdminUserDto) {
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
}
