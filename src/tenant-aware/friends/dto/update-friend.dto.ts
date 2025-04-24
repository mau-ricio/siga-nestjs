import { PartialType } from '@nestjs/mapped-types';
import { CreateFriendDto } from './create-friend.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateFriendDto extends PartialType(CreateFriendDto) {
  @ApiPropertyOptional({ example: 'Alice' })
  name?: string;
}
