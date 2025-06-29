import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsEnum,
  MaxLength,
  Matches,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TenantStatus } from '../entities/tenant.entity';
import { CreateUserDto } from '../../../tenant-aware/users/dto/create-user.dto';

export class CreateTenantDto {
  @ApiProperty({ example: 'tenant01' })
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'The slug must contain only lowercase letters, numbers, and hyphens, with no spaces or special characters.',
  })
  @MaxLength(50)
  slug: string;

  @ApiProperty({ example: 'Tenant 01' })
  @IsString()
  name: string;

  @ApiProperty({ type: 'string', format: 'uuid' })
  @IsUUID()
  databaseId: string;

  @ApiProperty({ enum: TenantStatus })
  @IsEnum(TenantStatus)
  status: TenantStatus;

  @ApiProperty({ description: 'id from erp system that created tenant here' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  externalId?: string;

  @ApiPropertyOptional({
    description: 'Initial admin user to create for the tenant',
    type: CreateUserDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateUserDto)
  initialUser?: CreateUserDto;
}
