import { PartialType } from '@nestjs/mapped-types';
import { CreateFriendDto } from './create-friend.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateFriendDto extends PartialType(CreateFriendDto) {
  @ApiPropertyOptional({ example: 'Alice' })
  name?: string;

  @ApiPropertyOptional({
    example: '+5511999887766',
    description: 'Optional phone number for the friend (international format)',
  })
  phoneNumber?: string;

  @ApiPropertyOptional({
    example: 'vinho',
    description: 'Preferred drink (4-100 characters, stored in lowercase)',
    minLength: 4,
    maxLength: 100,
  })
  preferredDrink?: string;
}
