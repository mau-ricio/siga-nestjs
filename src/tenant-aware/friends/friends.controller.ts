import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { FriendsService } from './friends.service';
import { CreateFriendDto } from './dto/create-friend.dto';
import { UpdateFriendDto } from './dto/update-friend.dto';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('friends')
@Controller('friends')
@ApiBearerAuth('tenant-jwt')
@UseGuards(AuthGuard('tenant-jwt'))
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @ApiOperation({ summary: 'Create a new friend' })
  @ApiResponse({ status: 201, description: 'Friend created successfully' })
  @Post()
  create(@Body() createDto: CreateFriendDto) {
    return this.friendsService.create(createDto);
  }

  @ApiOperation({ summary: 'Get all friends' })
  @ApiResponse({ status: 200, description: 'List of friends' })
  @Get()
  findAll() {
    return this.friendsService.findAll();
  }

  @ApiOperation({ summary: 'Get a friend by ID' })
  @ApiResponse({ status: 200, description: 'Friend details' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.friendsService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a friend' })
  @ApiResponse({ status: 200, description: 'Friend updated successfully' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateFriendDto) {
    return this.friendsService.update(id, updateDto);
  }

  @ApiOperation({ summary: 'Delete a friend' })
  @ApiResponse({ status: 204, description: 'Friend deleted successfully' })
  @HttpCode(204)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.friendsService.remove(id);
  }
}
