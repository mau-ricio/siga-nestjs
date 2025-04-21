import { Controller, Get, Post, Body, Param, Patch, Delete, HttpCode, HttpStatus, NotFoundException, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { Tenant } from './entities/tenant.entity';

@ApiTags('tenants')
@ApiBearerAuth('admin-jwt') //uses the token admin-jwt to validate
@UseGuards(AuthGuard('admin-jwt')) // Protect all routes in this controller
@Controller('admin/tenants')
export class TenantsController {
  constructor(private readonly service: TenantsService) {}

  @ApiOperation({ summary: 'Create a new tenant' })
  @ApiResponse({ status: 201, type: Tenant })
  @Post()
  create(@Body() dto: CreateTenantDto): Promise<Tenant> {
    return this.service.create(dto);
  }

  @ApiOperation({ summary: 'List all tenants' })
  @ApiResponse({ status: 200, type: [Tenant] })
  @Get()
  findAll(): Promise<Tenant[]> {
    return this.service.findAll();
  }

  @ApiOperation({ summary: 'Get tenant by id' })
  @ApiResponse({ status: 200, type: Tenant })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Tenant> {
    return this.service.findOne(id);
  }

  @ApiOperation({ summary: 'Update tenant' })
  @ApiResponse({ status: 200, type: Tenant })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateTenantDto): Promise<Tenant> {
    return this.service.update(id, dto);
  }

  @ApiOperation({ summary: 'Delete tenant' })
  @ApiResponse({ status: 204 })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
