import { Controller, Get, Post, Body, Param, Patch, Delete, HttpCode, HttpStatus, NotFoundException, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { DatabasesService } from './databases.service';
import { CreateDatabaseDto } from './dto/create-database.dto';
import { UpdateDatabaseDto } from './dto/update-database.dto';
import { Database } from './entities/database.entity';

@ApiTags('databases')
@ApiBearerAuth('admin-jwt') //uses the token admin-jwt to validate
@UseGuards(AuthGuard('admin-jwt')) // Protect all routes in this controller
@Controller('admin/databases')
export class DatabasesController {
  constructor(private readonly service: DatabasesService) {}

  @ApiOperation({ summary: 'Create database config' })
  @ApiResponse({ status: 201, type: Database })
  @Post()
  create(@Body() dto: CreateDatabaseDto): Promise<Database> {
    return this.service.create(dto);
  }

  @ApiOperation({ summary: 'List all database configs' })
  @ApiResponse({ status: 200, type: [Database] })
  @Get()
  findAll(): Promise<Database[]> {
    return this.service.findAll();
  }

  @ApiOperation({ summary: 'Get a database config by id' })
  @ApiResponse({ status: 200, type: Database })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Database> {
    const entity = await this.service.findOne(id);
    if (!entity) {
      throw new NotFoundException(`Database config with id ${id} not found`);
    }
    return entity;
  }

  @ApiOperation({ summary: 'Update a database config' })
  @ApiResponse({ status: 200, type: Database })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateDatabaseDto): Promise<Database> {
    const updated = await this.service.update(id, dto);
    if (!updated) {
      throw new NotFoundException(`Database config with id ${id} not found`);
    }
    return updated;
  }

  @ApiOperation({ summary: 'Delete a database config' })
  @ApiResponse({ status: 204 })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
