import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { TransactionsModule } from './transactions.module';

async function bootstrap() {
  // Cria aplicação HTTP
  const app = await NestFactory.create(TransactionsModule);

  // Habilita validação global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

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
  await app.listen(process.env.port ?? 3002);
  console.log(`🚀 Transactions app is running on: http://localhost:3002`);
}
bootstrap();
