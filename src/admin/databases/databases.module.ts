import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabasesService } from './databases.service';
import { DatabasesController } from './databases.controller';
import { Database } from './entities/database.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Database], 'admin')],
  controllers: [DatabasesController],
  providers: [DatabasesService],
  exports: [DatabasesService],
})
export class DatabasesModule {}
