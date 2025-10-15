<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

Monorepo NestJS para o Desafio Loomi contendo duas aplicações:

- **clients** - API para gerenciamento de clientes (porta 3001)
- **transactions** - API para gerenciamento de transações (porta 3002)

⚡ **Quick Start**: Execute `npm run setup` ou `make setup` para configurar tudo automaticamente!

📖 **Referência Rápida**: 
- `QUICK_REFERENCE.md` - Lista completa de comandos NPM
- `Makefile` - Use `make help` para ver comandos disponíveis

## Estrutura do Projeto

```
desafio-loomi-nestjs/
├── apps/
│   ├── clients/           # Aplicação de clientes
│   │   ├── src/
│   │   ├── test/
│   │   └── tsconfig.app.json
│   └── transactions/      # Aplicação de transações
│       ├── src/
│       ├── test/
│       └── tsconfig.app.json
├── libs/
│   └── prisma/            # Biblioteca compartilhada do Prisma
│       └── src/
│           ├── prisma.module.ts
│           ├── prisma.service.ts
│           └── index.ts
├── prisma/
│   ├── migrations/        # Migrações do banco de dados
│   │   └── 20241015030242_init/
│   │       └── migration.sql
│   └── schema.prisma      # Schema do Prisma com modelos User e Transaction
├── docker-compose.yml     # Orquestração completa (produção)
├── docker-compose.dev.yml # Apenas infraestrutura (desenvolvimento)
├── apps/
│   ├── clients/Dockerfile      # Dockerfile otimizado para clients
│   └── transactions/Dockerfile # Dockerfile otimizado para transactions
├── .dockerignore          # Arquivos ignorados no build Docker
├── .env                   # Variáveis de ambiente (não versionado)
├── .env.example           # Template de variáveis de ambiente
├── nest-cli.json          # Configuração do monorepo
├── DOCKER.md              # Documentação completa do Docker
├── QUICK_REFERENCE.md     # Referência rápida de comandos
├── Makefile               # Comandos Make para facilitar o uso
├── scripts/
│   └── setup.sh           # Script de setup automático
└── package.json
```

## Quick Start

### Setup Automático (Recomendado)

Execute o script de setup que configura tudo automaticamente:

```bash
# Clone o repositório (se ainda não fez)
# git clone <repository-url>
# cd desafio-loomi-nestjs

# Execute o script de setup
$ npm run setup
```

Este script irá:
1. ✅ Instalar dependências
2. ✅ Criar arquivo .env
3. ✅ Iniciar PostgreSQL, Redis e RabbitMQ em containers
4. ✅ Gerar Prisma Client
5. ✅ Aplicar migrações do banco
6. ✅ Fazer build das aplicações

Depois, inicie as aplicações:

```bash
# Terminal 1 - App Clients
$ npm run start:clients:dev

# Terminal 2 - App Transactions
$ npm run start:transactions:dev
```

### Setup Manual

Se preferir configurar manualmente:

```bash
# 1. Instalar dependências
$ npm install

# 2. Iniciar infraestrutura
$ npm run docker:dev:up

# 3. Configurar banco de dados
$ npm run prisma:generate
$ npm run prisma:migrate:deploy

# 4. Iniciar aplicações
$ npm run start:clients:dev
$ npm run start:transactions:dev
```

## Instalação Detalhada

### Instalação de Dependências

```bash
$ npm install
```

## Docker - Executar com Containers

O projeto possui configurações Docker completas para execução em containers.

### Modo 1: Desenvolvimento (apenas infraestrutura)

Use este modo quando quiser desenvolver localmente mas usar os serviços em containers:

```bash
# Iniciar PostgreSQL, Redis e RabbitMQ
$ npm run docker:dev:up

# Ver logs
$ npm run docker:dev:logs

# Parar serviços
$ npm run docker:dev:down
```

Depois inicie as aplicações localmente:
```bash
$ npm run start:clients:dev
$ npm run start:transactions:dev
```

### Modo 2: Produção (todos os serviços)

Use este modo para rodar tudo em containers:

```bash
# Build e iniciar todos os serviços
$ npm run docker:up

# Ver status dos containers
$ npm run docker:ps

# Ver logs de todos os serviços
$ npm run docker:logs

# Aplicar migrações (primeira vez)
$ docker-compose exec clients-app npx prisma migrate deploy

# Parar todos os serviços
$ npm run docker:down

# Limpar tudo (remove volumes e imagens)
$ npm run docker:clean
```

**Serviços disponíveis:**

| Serviço | URL/Porta | Container | Descrição |
|---------|-----------|-----------|-----------|
| Clients API | http://localhost:3001 | loomi-clients-app | API de usuários |
| Transactions API | http://localhost:3002 | loomi-transactions-app | API de transações |
| PostgreSQL | localhost:5432 | loomi-postgres | Banco de dados |
| Redis | localhost:6379 | loomi-redis | Cache |
| RabbitMQ | localhost:5672 | loomi-rabbitmq | Message broker |
| RabbitMQ UI | http://localhost:15672 | loomi-rabbitmq | Interface de gerenciamento |

**Credenciais:**
- **PostgreSQL**: loomi_user / loomi_password / loomi_db
- **RabbitMQ**: loomi_user / loomi_password
- **Redis**: sem autenticação

📖 **Documentação completa do Docker:** Veja o arquivo `DOCKER.md` para detalhes sobre arquitetura, troubleshooting e boas práticas.

## Configuração do Banco de Dados (Desenvolvimento Local)

Se você optou por desenvolver localmente sem containers para as aplicações:

### 1. Inicie apenas a infraestrutura

```bash
$ npm run docker:dev:up
```

### 2. Execute as migrações do Prisma

```bash
# Aplica as migrações existentes ao banco de dados
$ npm run prisma:migrate:deploy

# Ou cria uma nova migração (desenvolvimento)
$ npm run prisma:migrate
```

### 3. Gere o Prisma Client

```bash
$ npm run prisma:generate
```

### 4. (Opcional) Visualize os dados

```bash
# Abre o Prisma Studio no navegador
$ npm run prisma:studio
```

### Modelos do Banco de Dados

O projeto possui dois modelos principais:

- **User**: Modelo para gerenciamento de clientes
  - Campos: id, name, email, cpf, phone, address, city, state, zipCode, createdAt, updatedAt
  
- **Transaction**: Modelo para gerenciamento de transações
  - Campos: id, amount, type, description, status, userId, createdAt, updatedAt
  - Relacionamento: Cada transação pertence a um usuário

### Comandos úteis do Prisma

```bash
# Abre o Prisma Studio (interface visual do banco)
$ npm run prisma:studio

# Formata o schema
$ npm run prisma:format

# Gera o Prisma Client
$ npm run prisma:generate

# Valida o schema
$ npx prisma validate
```

## Biblioteca Prisma Compartilhada

O projeto possui uma biblioteca compartilhada (`@app/prisma`) que contém o `PrismaService` e `PrismaModule`. Esta biblioteca pode ser usada por ambas as aplicações (clients e transactions).

### Como usar o PrismaService

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/prisma';

@Injectable()
export class YourService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    // Acesse os modelos diretamente através do PrismaService
    return this.prisma.user.findMany();
  }
}
```

### Configuração do Prisma Client

O Prisma Client está configurado para ser gerado em `node_modules/@prisma/client`, garantindo que ambas as aplicações do monorepo possam acessá-lo sem problemas. Após qualquer alteração no `schema.prisma`, execute:

```bash
$ npx prisma generate
```

## Sistema de Cache com Redis

O app **clients** está configurado com cache usando Redis para melhorar a performance das consultas.

### Características do Cache

- ✅ **Cache Global**: Configurado no `CacheModule` como global
- ✅ **TTL**: 60 segundos (configurável)
- ✅ **Invalidação Automática**: Cache é invalidado automaticamente ao criar, atualizar ou deletar usuários
- ✅ **Endpoints Cacheados**: GET `/api/users` e GET `/api/users/:id`

### Como Funciona

1. **GET `/api/users`** - A primeira requisição busca do banco e armazena no cache. Requisições subsequentes retornam do cache até o TTL expirar ou o cache ser invalidado.

2. **GET `/api/users/:id`** - Similar ao endpoint acima, mas cacheia usuários individualmente.

3. **PATCH `/api/users/:id`** - Ao atualizar um usuário, o cache desse usuário específico e da lista de usuários é invalidado automaticamente.

4. **POST `/api/users`** - Ao criar um usuário, o cache da lista de usuários é invalidado.

5. **DELETE `/api/users/:id`** - Ao deletar um usuário, o cache desse usuário e da lista é invalidado.

### Verificar Status do Cache

```bash
# Conectar ao Redis CLI
docker exec -it loomi-redis redis-cli

# Ver todas as chaves em cache
KEYS *

# Ver uma chave específica
GET "/api/users"

# Limpar todo o cache
FLUSHALL
```

## RabbitMQ - Message Broker

O projeto está configurado para usar RabbitMQ como message broker para comunicação assíncrona entre serviços.

### Características

- ✅ **RabbitMQ 3.13**: Versão estável e otimizada
- ✅ **Management UI**: Interface web para gerenciamento
- ✅ **Persistência**: Mensagens persistidas em volume Docker
- ✅ **Health Check**: Monitora disponibilidade do serviço

### Acesso ao RabbitMQ

**Management UI**: http://localhost:15672

**Credenciais:**
- Username: `loomi_user`
- Password: `loomi_password`

**AMQP URL**: `amqp://loomi_user:loomi_password@localhost:5672`

### Recursos da Management UI

- 📊 Ver filas e exchanges
- 📈 Monitorar mensagens em tempo real
- 👥 Gerenciar usuários e permissões
- ⚡ Ver estatísticas de performance
- 🔍 Inspecionar mensagens
- 🎯 Publicar mensagens manualmente

### Comunicação Entre Apps via RabbitMQ

O projeto implementa **comunicação assíncrona** entre as aplicações usando RabbitMQ.

#### Evento Implementado: `user_banking_updated`

Quando um usuário é atualizado no app **clients**, um evento é emitido via RabbitMQ e consumido pelo app **transactions**.

**Fluxo:**
```
1. PATCH /api/users/:id (Clients App)
   ↓
2. UsersService atualiza usuário
   ↓
3. Emite evento 'user_banking_updated' → RabbitMQ
   ↓
4. Transactions App recebe evento
   ↓
5. TransactionsController processa (@EventPattern)
```

**Como testar:**

```bash
# 1. Iniciar RabbitMQ
npm run docker:dev:up

# 2. Iniciar apps
npm run start:clients:dev        # Terminal 1
npm run start:transactions:dev   # Terminal 2

# 3. Atualizar usuário
curl -X PATCH http://localhost:3001/api/users/{userId} \
  -H "Content-Type: application/json" \
  -d '{"name": "Nome Atualizado"}'

# 4. Ver logs do Transactions App
# Deve mostrar: 📥 Evento recebido: user_banking_updated
```

📖 **Documentação completa:** 
- `RABBITMQ_INTEGRATION.md` - Arquitetura, implementação e casos de uso
- `TESTE_RABBITMQ.md` - Guia passo a passo para testar a integração

🐰 **RabbitMQ**: Atualizações de usuário disparam eventos assíncronos para o app transactions!

## 📚 Documentação Swagger/OpenAPI

Ambas as aplicações possuem documentação interativa automática usando Swagger.

### Acesso à Documentação

| Aplicação | URL | Descrição |
|-----------|-----|-----------|
| **Clients API** | http://localhost:3001/api/docs | Documentação da API de usuários |
| **Transactions API** | http://localhost:3002/api/docs | Documentação da API de transações |

### Recursos

- ✅ **Interface Interativa**: Teste endpoints diretamente no navegador
- ✅ **Schemas Completos**: Visualize estrutura de DTOs com validações
- ✅ **Exemplos Prontos**: Payloads pré-preenchidos para testes
- ✅ **Códigos HTTP**: Todos os status codes documentados
- ✅ **Try it Out**: Execute requisições sem Postman/cURL
- ✅ **Export Spec**: Baixe OpenAPI JSON/YAML

### Como Usar

```bash
# 1. Iniciar aplicação
npm run start:clients:dev

# 2. Acessar Swagger no navegador
open http://localhost:3001/api/docs

# 3. Expandir endpoint desejado
# 4. Clicar em "Try it out"
# 5. Executar requisição
# 6. Ver resposta
```

📖 **Documentação completa do Swagger:** Veja `SWAGGER.md` para guia detalhado, exemplos e integrações.

## Executar as Aplicações

### Aplicação Clients (Porta 3001)

```bash
# desenvolvimento
$ npm run start:clients

# modo watch
$ npm run start:clients:dev

# modo debug
$ npm run start:clients:debug

# produção
$ npm run start:clients:prod
```

**📚 Swagger UI:** http://localhost:3001/api/docs

#### Endpoints disponíveis:

- **GET** `/api/users` - Lista todos os usuários
- **GET** `/api/users/:id` - Busca um usuário por ID
- **POST** `/api/users` - Cria um novo usuário
- **PATCH** `/api/users/:id` - Atualiza um usuário
- **DELETE** `/api/users/:id` - Remove um usuário

**Exemplo de uso:**

```bash
# Criar um usuário
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "cpf": "123.456.789-00",
    "phone": "(11) 98765-4321"
  }'

# Buscar usuário por ID
curl http://localhost:3001/api/users/{userId}

# Listar todos os usuários
curl http://localhost:3001/api/users

# Atualizar um usuário (atualização parcial)
curl -X PATCH http://localhost:3001/api/users/{userId} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva Atualizado",
    "phone": "(11) 91234-5678"
  }'

# Deletar um usuário
curl -X DELETE http://localhost:3001/api/users/{userId}
```

💡 **Dica:** Use o arquivo `apps/clients/src/users/users.http` com a extensão REST Client do VSCode para testar os endpoints.

📖 **Documentação completa:** 
- Veja os arquivos .md na raiz do projeto para documentação detalhada

⚡ **Cache**: Os endpoints GET estão otimizados com Redis para melhor performance!

🐰 **RabbitMQ**: Atualizações de usuário disparam eventos assíncronos para o app transactions!

### Aplicação Transactions (Porta 3002)

```bash
# desenvolvimento
$ npm run start:transactions

# modo watch
$ npm run start:transactions:dev

# modo debug
$ npm run start:transactions:debug

# produção
$ npm run start:transactions:prod
```

**📚 Swagger UI:** http://localhost:3002/api/docs

#### Endpoints disponíveis:

- **POST** `/api/transactions` - Cria uma nova transação
- **GET** `/api/transactions` - Lista todas as transações
- **GET** `/api/transactions/:transactionId` - Busca uma transação específica por ID
- **GET** `/api/transactions/user/:userId` - Lista todas as transações de um usuário
- **PATCH** `/api/transactions/:id` - Atualiza uma transação
- **DELETE** `/api/transactions/:id` - Remove uma transação

**Campos do CreateTransactionDto:**

| Campo | Tipo | Validação | Obrigatório |
|-------|------|-----------|-------------|
| amount | number | Positivo, máx 2 decimais | Sim |
| type | string | 'credit', 'debit' ou 'transfer' | Sim |
| description | string | - | Não |
| status | string | 'pending', 'completed', 'failed' ou 'cancelled' | Sim |
| userId | string | UUID válido de usuário existente | Sim |

**Exemplo de uso:**

```bash
# Criar uma transação
curl -X POST http://localhost:3002/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 150.50,
    "type": "credit",
    "description": "Pagamento recebido",
    "status": "completed",
    "userId": "user-id-aqui"
  }'

# Listar todas as transações
curl http://localhost:3002/api/transactions

# Buscar transação específica por ID
curl http://localhost:3002/api/transactions/{transactionId}

# Listar todas as transações de um usuário
curl http://localhost:3002/api/transactions/user/{userId}

# Atualizar status de uma transação
curl -X PATCH http://localhost:3002/api/transactions/{transactionId} \
  -H "Content-Type: application/json" \
  -d '{
    "status": "cancelled"
  }'
```

💡 **Dica:** Use o arquivo `apps/transactions/src/transactions/transactions.http` com a extensão REST Client do VSCode para testar os endpoints.

📖 **Documentação completa da API de Transações:** 
- `TRANSACTIONS_API.md` - Documentação do endpoint POST com validações
- `TRANSACTIONS_GET_API.md` - Documentação dos endpoints GET com exemplos detalhados

## Build das Aplicações

```bash
# Build de todas as aplicações
$ npm run build

# Build específico
$ npm run build:clients
$ npm run build:transactions
```

## Executar Testes

```bash
# testes unitários
$ npm run test

# testes e2e - clients
$ npm run test:e2e:clients

# testes e2e - transactions
$ npm run test:e2e:transactions

# cobertura de testes
$ npm run test:cov
```

## 📖 Documentação Completa

Este projeto possui documentação extensiva para facilitar o desenvolvimento e manutenção:

| Documento | Descrição |
|-----------|-----------|
| **README.md** | Documentação principal do projeto (este arquivo) |
| **QUICK_REFERENCE.md** | Referência rápida de todos os comandos |
| **DOCKER.md** | Guia completo de Docker e containerização |
| **PROJECT_SUMMARY.md** | Resumo do projeto, arquitetura e tecnologias |
| **SWAGGER.md** | Guia completo do Swagger/OpenAPI (documentação automática) |
| **RABBITMQ_INTEGRATION.md** | Integração RabbitMQ entre apps (arquitetura e implementação) |
| **TESTE_RABBITMQ.md** | Guia passo a passo para testar eventos RabbitMQ |
| **TRANSACTIONS_API.md** | Documentação detalhada do endpoint POST transactions |
| **TRANSACTIONS_GET_API.md** | Documentação dos endpoints GET transactions |
| **Makefile** | Comandos Make (`make help` para ver todos) |
| **scripts/setup.sh** | Script de setup automático |

### Arquivos de Teste HTTP

| Arquivo | Descrição |
|---------|-----------|
| `apps/clients/src/users/users.http` | Testes da API de usuários |
| `apps/transactions/src/transactions/transactions.http` | Testes da API de transações |

💡 Use a extensão **REST Client** do VSCode para executar as requisições diretamente no editor.

## 🚀 Deployment

### Com Docker (Recomendado)

O projeto está totalmente containerizado e pronto para deploy:

```bash
# Build e iniciar todos os serviços
docker-compose up --build -d

# Aplicar migrações
docker-compose exec clients-app npx prisma migrate deploy

# Verificar status
docker-compose ps
```

### Plataformas Sugeridas

- **Docker Swarm**: Orquestração simples
- **Kubernetes**: Orquestração avançada
- **AWS ECS**: Elastic Container Service
- **Google Cloud Run**: Serverless containers
- **Azure Container Instances**: Containers gerenciados
- **DigitalOcean App Platform**: Deploy simplificado

### Checklist de Produção

- [ ] Configurar variáveis de ambiente
- [ ] Aplicar migrações do banco
- [ ] Configurar resource limits
- [ ] Implementar logging estruturado
- [ ] Configurar monitoramento
- [ ] Implementar rate limiting
- [ ] Configurar CORS
- [ ] Adicionar autenticação
- [ ] Configurar SSL/TLS
- [ ] Implementar backup de dados

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
