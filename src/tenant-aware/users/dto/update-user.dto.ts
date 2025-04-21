import { ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({ description: 'The email of the user', example: 'user@example.com' })
  email?: string;

  @ApiPropertyOptional({ description: 'The name of the user', example: 'John Doe' })
  name?: string;

  @ApiPropertyOptional({ description: 'The password of the user', example: 'strongPassword123', minLength: 6 })
  password?: string;

  @ApiPropertyOptional({ description: 'Whether the user is active', example: true })
  active?: boolean;
}
