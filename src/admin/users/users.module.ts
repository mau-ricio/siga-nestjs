import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { UserTenantsController } from './user-tenants.controller';
import { UserTenantsService } from './user-tenants.service';
import { UserTenant } from './entities/user-tenant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User], 'admin'),
    TypeOrmModule.forFeature([UserTenant], 'admin'),
  ],
  controllers: [UsersController, UserTenantsController],
  providers: [UsersService, UserTenantsService],
})
export class UsersModule {}
