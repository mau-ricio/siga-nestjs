import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // Remove temporarily
import { UsersService } from './users.service'; // Remove temporarily
import { UsersController } from './users.controller';
import { User } from './entities/user.entity'; // Remove temporarily
import { AuthModule } from '../../auth/auth.module';
import { AuthGuard } from '@nestjs/passport'; // Remove temporarily

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // Remove temporarily
    AuthModule,
  ],
  controllers: [UsersController],
  providers: [ UsersService ],
  exports: [UsersService], // Remove temporarily
})
export class UsersModule {}