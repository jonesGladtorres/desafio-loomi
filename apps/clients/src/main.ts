import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ClientsModule } from './clients.module';
import helmet from 'helmet';
import { helmetConfig } from '@app/security/config/helmet.config';
import { corsConfig } from '@app/security/config/cors.config';

async function bootstrap() {
  const app = await NestFactory.create(ClientsModule);

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
    .setTitle('Loomi - Users API')
    .setDescription(
      `API REST para gerenciamento completo de usuários e clientes.
      
**Funcionalidades:**
- ✅ CRUD completo de usuários
- ✅ Validação de CPF
- ✅ Upload de foto de perfil
- ✅ Gerenciamento de dados bancários
- ✅ Cache com Redis para performance
- ✅ Eventos assíncronos via RabbitMQ

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
    .addTag('users', 'Operações de CRUD para gerenciamento de usuários')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs/users', app, document, {
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
    `📚 Swagger docs available at: http://localhost:${port}/api/docs/users`,
  );
}
void bootstrap();
