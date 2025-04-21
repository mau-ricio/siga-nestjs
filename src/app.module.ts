import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import * as path from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TenantMiddleware } from './shared/middlewares/tenant.middleware';
import { TenantInterceptor } from './shared/interceptors/tenant.interceptor';
import { UsersModule } from './tenant-aware/users/users.module';
import { SharedModule } from './shared/shared.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TenantsModule } from './admin/tenants/tenants.module';
import { DatabasesModule } from './admin/databases/databases.module';
import { AdminUserModule } from './admin/admin-users/admin-user.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    AuthModule,
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
    AdminUserModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_INTERCEPTOR, useClass: TenantInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .exclude({ path: 'admin/(.*)', method: RequestMethod.ALL })
      .forRoutes('*');
  }
}
