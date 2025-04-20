import { Controller, Get, Post, Put, Delete, Param, Body, HttpCode, HttpStatus, NotFoundException, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { UserTenantsService } from './user-tenants.service';
import { CreateUserTenantDto } from './dto/create-user-tenant.dto';
import { UpdateUserTenantDto } from './dto/update-user-tenant.dto';
import { UserTenant } from './entities/user-tenant.entity';

@ApiTags('User Tenants')
@Controller('users/:userId/tenants')
export class UserTenantsController {
  constructor(private readonly userTenantsService: UserTenantsService) {}

  @ApiOperation({ summary: 'Get all tenant assignments for a user' })
  @ApiParam({ name: 'userId', description: 'UUID of the user' })
  @ApiResponse({ status: 200, description: 'List of user tenant assignments', type: [UserTenant] })
  @Get()
  findAll(@Param('userId') userId: string): Promise<UserTenant[]> {
    return this.userTenantsService.findAll(userId);
  }

  @ApiOperation({ summary: 'Get a specific tenant assignment for a user' })
  @ApiParam({ name: 'userId', description: 'UUID of the user' })
  @ApiParam({ name: 'id', description: 'UUID of the user tenant assignment' })
  @ApiResponse({ status: 200, description: 'User tenant assignment details', type: UserTenant })
  @Get(':id')
  async findOne(@Param('userId') userId: string, @Param('id') id: string): Promise<UserTenant> {
    return this.userTenantsService.findOne(userId, id);
  }

  @ApiOperation({ summary: 'Assign a tenant to a user' })
  @ApiParam({ name: 'userId', description: 'UUID of the user' })
  @ApiBody({ type: CreateUserTenantDto })
  @ApiResponse({ status: 201, description: 'User tenant assignment created', type: UserTenant })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  create(@Param('userId') userId: string, @Body() dto: CreateUserTenantDto): Promise<UserTenant> {
    return this.userTenantsService.create(userId, dto);
  }

  @ApiOperation({ summary: 'Update a tenant assignment for a user' })
  @ApiParam({ name: 'userId', description: 'UUID of the user' })
  @ApiParam({ name: 'id', description: 'UUID of the user tenant assignment' })
  @ApiBody({ type: UpdateUserTenantDto })
  @ApiResponse({ status: 200, description: 'User tenant assignment updated', type: UserTenant })
  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  update(
    @Param('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateUserTenantDto,
  ): Promise<UserTenant> {
    return this.userTenantsService.update(userId, id, dto);
  }

  @ApiOperation({ summary: 'Remove a tenant assignment from a user' })
  @ApiParam({ name: 'userId', description: 'UUID of the user' })
  @ApiParam({ name: 'id', description: 'UUID of the user tenant assignment' })
  @ApiResponse({ status: 204, description: 'User tenant assignment removed' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('userId') userId: string, @Param('id') id: string): Promise<void> {
    await this.userTenantsService.remove(userId, id);
  }
}
