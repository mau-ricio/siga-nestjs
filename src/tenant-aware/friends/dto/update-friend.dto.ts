import { PartialType } from '@nestjs/mapped-types';
import { CreateFriendDto } from './create-friend.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateFriendDto extends PartialType(CreateFriendDto) {
  @ApiPropertyOptional({ example: 'Alice' })
  name?: string;

  @ApiPropertyOptional({
    example: 'vinho',
    description:
      'Preferred drink (optional, min 4 characters, stored in lowercase)',
    maxLength: 100,
    minLength: 4,
  })
  beveragePreference?: string;
}
