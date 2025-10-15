import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ClientsModule } from './clients.module';

async function bootstrap() {
  const app = await NestFactory.create(ClientsModule);

  // Habilita validação global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('Loomi - Clients API')
    .setDescription('API para gerenciamento de clientes e usuários')
    .setVersion('1.0')
    .addTag('users', 'Endpoints relacionados a usuários')
    .addTag('clients', 'Endpoints relacionados ao serviço de clientes')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  await app.listen(process.env.port ?? 3001);
  console.log(`🚀 Clients app is running on: http://localhost:3001`);
  console.log(`📚 Swagger docs available at: http://localhost:3001/api/docs`);
}
bootstrap();
