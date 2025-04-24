import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => SharedModule), // Use forwardRef to avoid circular dependency
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Ensure UsersService is exported
})
export class UsersModule {}