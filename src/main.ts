import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Siga NestJS API')
    .setDescription('API documentation for SSE NestJS application')
    .setVersion('1.0')
    .addApiKey(
      { type: 'apiKey', name: 'x-tenant-id', in: 'header', description: 'Tenant ID header' },
      'x-tenant-id',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  // Require x-tenant-id header for all endpoints
  (document as any).security = [{ 'x-tenant-id': [] }];
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
