// filepath: src/admin/admin-users/dto/create-admin-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, MinLength, IsNotEmpty } from 'class-validator';

export class CreateAdminUserDto {
  @ApiProperty({ description: 'Unique username for the admin user' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'Password for the admin user', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'Email address of the admin user' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
