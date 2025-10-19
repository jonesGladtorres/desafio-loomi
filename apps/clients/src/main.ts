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
    .setTitle('Loomi - Users API')
    .setDescription('API para gerenciamento de usuários')
    .setVersion('1.0')
    .addTag('users', 'Operações de CRUD para gerenciamento de usuários')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`🚀 Users app is running on: http://localhost:${port}`);
  console.log(
    `📚 Swagger docs available at: http://localhost:${port}/api/docs`,
  );
}
void bootstrap();
