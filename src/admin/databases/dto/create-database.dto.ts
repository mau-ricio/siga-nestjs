import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsUrl } from 'class-validator';
import { DatabaseType } from '../entities/database.entity';

export class CreateDatabaseDto {
  @ApiProperty({ example: 'TenantDB1' })
  @IsString()
  name: string;

  @ApiProperty({ enum: DatabaseType })
  @IsEnum(DatabaseType)
  type: DatabaseType;

  @ApiProperty({ example: 'postgres://user:pass@host:5432/dbname or sqlite://./sharedDB.sqlite' })
  @IsString()
  url: string;
}
