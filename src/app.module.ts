import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config'; // Import ConfigModule
import * as path from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from './shared/shared.module';
import { UsersModule } from './tenant-aware/users/users.module';
import { TenantsModule } from './admin/tenants/tenants.module';
import { DatabasesModule } from './admin/databases/databases.module';
import { AdminUserModule } from './admin/admin-users/admin-user.module';
import { AuthModule } from './auth/auth.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TenantInterceptor } from './shared/interceptors/tenant.interceptor';
import { TenantMiddleware } from './shared/middlewares/tenant.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ // Configure ConfigModule
      isGlobal: true,      // Make it global
      envFilePath: '.env', // Specify .env file if needed
    }),
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
    TypeOrmModule.forRootAsync({
      name: 'admin',
      useFactory: () => ({
        ...(process.env.NODE_ENV === 'production'
          ? {
              type: process.env.ADMINDBTYPE as any,
              url: process.env.ADMINDBURL,
            }
          : {
              type: 'sqlite',
              database: path.resolve(process.cwd(), 'admin.sqlite'),
            }),
        entities: [__dirname + '/admin/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
    }),
    SharedModule,
    UsersModule,
    TenantsModule,
    DatabasesModule,
    AdminUserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
     { provide: APP_INTERCEPTOR, useClass: TenantInterceptor }, // Temporarily remove global interceptor
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .exclude(
        { path: 'admin/*', method: RequestMethod.ALL },
        { path: 'auth/admin/*', method: RequestMethod.ALL },
      )
      .forRoutes('*');
  }
}
