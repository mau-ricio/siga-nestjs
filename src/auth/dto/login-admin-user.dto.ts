import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginAdminUserDto {
  @ApiProperty({ description: 'Admin username' })
  @IsString()
  email: string;

  @ApiProperty({ description: 'Admin password' })
  @IsString()
  password: string;
}
