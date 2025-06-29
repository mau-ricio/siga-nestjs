import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsPhoneNumber,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

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

  @ApiPropertyOptional({
    example: 'cerveja',
    description: 'Preferred drink (4-100 characters, stored in lowercase)',
    minLength: 4,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(4, { message: 'Preferred drink must have at least 4 characters' })
  @MaxLength(100, { message: 'Preferred drink cannot exceed 100 characters' })
  @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase().trim() : value))
  preferredDrink?: string;
}
