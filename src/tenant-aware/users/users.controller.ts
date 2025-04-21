import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Logger } from '@nestjs/common';
import { UsersService } from './users.service'; // Restore
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
@ApiBearerAuth('tenant-jwt')
@UseGuards(AuthGuard('tenant-jwt'))
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  // Restore UsersService injection
  constructor(private readonly usersService: UsersService) {
    this.logger.log('UsersController instantiated');
  }

  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    this.logger.log('create method reached');
    return this.usersService.create(createUserDto); // Restore service call
    // return { message: 'Create endpoint reached (service removed)' };
  }

  @ApiOperation({ summary: 'Retrieve all users' })
  @ApiResponse({ status: 200, description: 'List of users' })
  @Get()
  findAll() {
    return this.usersService.findAll(); // Restore service call
  }

  @ApiOperation({ summary: 'Retrieve a user by ID' })
  @ApiResponse({ status: 200, description: 'User details' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id); // Restore service call
  }

  @ApiOperation({ summary: 'Update a user by ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    this.logger.log(`update method reached with id: ${id}`);
    return this.usersService.update(id, updateUserDto); // Restore service call
    // return { message: `Update endpoint reached with id: ${id} (service removed)` };
  }

  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    this.logger.log(`remove method reached with id: ${id}`);
    return this.usersService.remove(id); // Restore service call
    // return { message: `Remove endpoint reached with id: ${id} (service removed)` };
  }
}