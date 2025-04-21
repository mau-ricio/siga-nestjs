// filepath: src/admin/admin-users/admin-user.controller.ts
import { Controller, Get, Post, Put, Delete, Param, Body, UsePipes, ValidationPipe, UseGuards, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AdminUserService } from './admin-user.service';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { AdminUser } from './admin-user.entity';

@ApiTags('Admin Users')
@ApiBearerAuth('admin-jwt')
@UseGuards(AuthGuard('admin-jwt'))
@Controller('admin-users')
export class AdminUserController {
  constructor(private readonly service: AdminUserService) {}

  @Get()
  @ApiOperation({ summary: 'List all admin users' })
  @ApiResponse({ status: 200, description: 'List of admin users', type: [AdminUser] })
  findAll(): Promise<AdminUser[]> {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an admin user by ID' })
  @ApiParam({ name: 'id', description: 'Admin user ID' })
  @ApiResponse({ status: 200, description: 'The admin user', type: AdminUser })
  async findOne(@Param('id') id: string): Promise<AdminUser> {
    const user = await this.service.findOne(id);
    if (!user) {
      throw new NotFoundException(`Admin user with ID ${id} not found`);
    }
    return user;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new admin user' })
  @ApiResponse({ status: 201, description: 'The created admin user', type: AdminUser })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  create(@Body() dto: CreateAdminUserDto): Promise<AdminUser> {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing admin user' })
  @ApiParam({ name: 'id', description: 'Admin user ID' })
  @ApiResponse({ status: 200, description: 'The updated admin user', type: AdminUser })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(@Param('id') id: string, @Body() dto: UpdateAdminUserDto): Promise<AdminUser> {
    const updatedUser = await this.service.update(id, dto);
    if (!updatedUser) {
      throw new NotFoundException(`Admin user with ID ${id} not found`);
    }
    return updatedUser;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete an admin user' })
  @ApiParam({ name: 'id', description: 'Admin user ID' })
  @ApiResponse({ status: 204, description: 'Deleted successfully' })
  remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
