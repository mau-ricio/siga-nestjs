import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import * as path from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TenantMiddleware } from './shared/middlewares/tenant.middleware';
import { TenantInterceptor } from './shared/interceptors/tenant.interceptor';
import { UsersModule } from './users/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  // Database connection: SQLite for dev, PostgreSQL for production
  imports: [
    TypeOrmModule.forRoot({
      ...(process.env.NODE_ENV === 'production'
        ? {
            type: 'postgres',
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT) || 5432,
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
          }
        : {
            type: 'sqlite',
            database: path.resolve(process.cwd(), 'dev.sqlite'),
          }),
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_INTERCEPTOR, useClass: TenantInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
