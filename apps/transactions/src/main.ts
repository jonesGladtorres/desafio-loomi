import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { TransactionsResourceModule } from './transactions/transactions.module';

async function bootstrap() {
  // Cria aplicação HTTP
  const app = await NestFactory.create(TransactionsResourceModule);

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
    .setTitle('Loomi - Transactions API')
    .setDescription('API para gerenciamento de transações financeiras')
    .setVersion('1.0')
    .addTag('transactions', 'Endpoints relacionados a transações financeiras')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  // Conecta o microservice RabbitMQ (modo híbrido)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [
        process.env.RABBITMQ_URL ||
          'amqp://loomi_user:loomi_password@localhost:5672',
      ],
      queue: 'user_events_queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  // Inicia os microservices
  await app.startAllMicroservices();
  console.log('🐰 RabbitMQ microservice is listening...');

  // Inicia o servidor HTTP
  const port = process.env.PORT ?? 3002;
  await app.listen(port);
  console.log(`🚀 Transactions app is running on: http://localhost:${port}`);
  console.log(
    `📚 Swagger docs available at: http://localhost:${port}/api/docs`,
  );
}
void bootstrap();
