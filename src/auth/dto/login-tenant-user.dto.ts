import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginTenantUserDto {
  @ApiProperty({ description: 'Tenant username' })
  @IsString()
  username: string;

  @ApiProperty({ description: 'Tenant password' })
  @IsString()
  password: string;

  @ApiProperty({ description: 'Tenant ID' })
  @IsString()
  tenantId: string;
}
