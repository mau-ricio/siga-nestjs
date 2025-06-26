import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsPhoneNumber,
} from 'class-validator';

export class CreateFriendDto {
  @ApiProperty({ example: 'Alice' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: '+5511999887766',
    description: 'Optional phone number for the friend (international format)',
  })
  @IsOptional()
  @IsPhoneNumber() // Use default validation (any valid international format)
  phoneNumber?: string;
}
