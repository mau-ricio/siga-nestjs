import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('SIGA API')
    .setDescription('API documentation for SIGA application')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Admin JWT',
        description: 'Enter Admin JWT token',
        in: 'header',
      },
      'admin-jwt', // This name must match the name used in @ApiBearerAuth decorator for admin routes
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Tenant JWT',
        description: 'Enter Tenant JWT token',
        in: 'header',
      },
      'tenant-jwt', // This name must match the name used in @ApiBearerAuth decorator for tenant routes
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
