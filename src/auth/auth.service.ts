import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../tenant-aware/users/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async tenantLogin(loginDto: { username: string; password: string; tenantId: string }) {
    const user = await this.userRepository.findOne({ where: { email: loginDto.username } });

    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }


    const payload = { username: user.email, sub: loginDto.tenantId };
    return {
      access_token: this.jwtService.sign(payload, { secret: process.env.TENANT_JWT_SECRET }),
    };
  }

  async adminLogin(loginDto: { username: string; password: string }) {
    // Replace with actual admin authentication logic
    if (loginDto.username === 'admin' && loginDto.password === 'password') {
      const payload = { username: loginDto.username, sub: 'admin-id' };
      return {
        access_token: this.jwtService.sign(payload, { secret: process.env.ADMIN_JWT_SECRET }),
      };
    }
    throw new UnauthorizedException('Invalid admin credentials');
  }
}
