import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { TransactionsModule } from './transactions.module';

async function bootstrap() {
  const app = await NestFactory.create(TransactionsModule);

  // Habilita validação global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.port ?? 3002);
  console.log(`🚀 Transactions app is running on: http://localhost:3002`);
}
bootstrap();
