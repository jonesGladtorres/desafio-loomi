import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { TransactionsResourceModule } from './transactions/transactions.module';
import helmet from 'helmet';
import { helmetConfig } from '@app/security/config/helmet.config';
import { corsConfig } from '@app/security/config/cors.config';

async function bootstrap() {
  // Cria aplicação HTTP
  const app = await NestFactory.create(TransactionsResourceModule);

  // ====================================
  // SEGURANÇA
  // ====================================

  // Helmet - Proteção de Headers HTTP
  app.use(helmet(helmetConfig));

  // CORS - Controle de Origem Cruzada
  app.enableCors(corsConfig);

  // Habilita validação global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: process.env.NODE_ENV === 'production', // Esconde detalhes em produção
    }),
  );

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('Loomi - Transactions API')
    .setDescription(
      `API REST para gerenciamento completo de transações financeiras.
      
**Funcionalidades:**
- ✅ Transações de crédito, débito e transferência
- ✅ Validação de saldos e regras de negócio
- ✅ Histórico completo de transações
- ✅ Notificações assíncronas via RabbitMQ
- ✅ Cache com Redis para performance
- ✅ Processamento de eventos de atualização bancária

**Tipos de Transação:**
- 💰 **CREDIT**: Adiciona valor ao saldo do usuário
- 💸 **DEBIT**: Remove valor do saldo do usuário
- 🔄 **TRANSFER**: Transfere valor entre dois usuários

**Segurança:**
- 🔒 Autenticação obrigatória via API Key
- 🛡️ Rate Limiting (10/seg, 100/min, 1000/hora)
- 🔐 Headers de segurança (Helmet)
- 🚫 Proteção XSS e sanitização de dados
- 📝 Auditoria completa de requisições

**Como usar a API Key:**
1. Obtenha uma API Key válida
2. Adicione no header: \`X-API-Key: sua-chave\`
3. Ou use: \`Authorization: Bearer sua-chave\``,
    )
    .setVersion('1.0.0')
    .setContact(
      'Jones Torres',
      'https://github.com/jonesGladtorres',
      'jonestorresadv@icloud.com',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-API-Key',
        in: 'header',
        description:
          'API Key para autenticação (formato: X-API-Key: loomi-dev-key-123)',
      },
      'X-API-Key',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'API-Key',
        description:
          'API Key para autenticação (formato: Bearer loomi-dev-key-123)',
      },
      'Bearer',
    )
    .addTag('transactions', 'Endpoints relacionados a transações financeiras')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs/transactions', app, document, {
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
    `📚 Swagger docs available at: http://localhost:${port}/api/docs/transactions`,
  );
}
void bootstrap();
