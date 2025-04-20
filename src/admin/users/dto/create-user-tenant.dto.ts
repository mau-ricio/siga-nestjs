import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString } from 'class-validator';

export class CreateUserTenantDto {
  @ApiProperty({ description: 'UUID of the tenant' })
  @IsUUID()
  tenantId: string;

  @ApiProperty({ description: 'Role of the user in the tenant' })
  @IsString()
  role: string;
}
