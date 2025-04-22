import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginTenantUserDto {
  @ApiProperty({ description: 'Tenant user email', example: 'user@tenant.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Tenant password' })
  @IsString()
  password: string;

}
