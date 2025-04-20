import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsEnum } from 'class-validator';
import { TenantStatus } from '../entities/tenant.entity';

export class CreateTenantDto {
  @ApiProperty({ example: 'Tenant A' })
  @IsString()
  name: string;

  @ApiProperty({ type: 'string', format: 'uuid' })
  @IsUUID()
  databaseId: string;

  @ApiProperty({ enum: TenantStatus })
  @IsEnum(TenantStatus)
  status: TenantStatus;
}
