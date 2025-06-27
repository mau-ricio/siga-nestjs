import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
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
    example: 'cerveja',
    description:
      'Preferred drink (optional, min 4 characters, stored in lowercase)',
    maxLength: 100,
    minLength: 4,
  })
  @IsOptional()
  @IsString()
  @MinLength(4, {
    message: 'Beverage preference must have at least 4 characters',
  })
  @MaxLength(100, {
    message: 'Beverage preference cannot exceed 100 characters',
  })
  @Transform(({ value }) => (value ? (value as string).toLowerCase() : value))
  beveragePreference?: string;
}
