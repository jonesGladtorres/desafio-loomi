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
├── docker-compose.yml     # Configuração do PostgreSQL
├── .env                   # Variáveis de ambiente (não versionado)
├── .env.example           # Template de variáveis de ambiente
├── nest-cli.json          # Configuração do monorepo
└── package.json
```

## Instalação

```bash
$ npm install
```

## Configuração do Banco de Dados

Este projeto usa Prisma ORM com PostgreSQL. Siga os passos abaixo para configurar:

### 1. Inicie o banco de dados PostgreSQL

O projeto inclui um `docker-compose.yml` para facilitar a configuração do PostgreSQL:

```bash
# Inicie o PostgreSQL usando Docker Compose
$ npm run db:up
# ou
$ docker-compose up -d

# Verifique se o container está rodando
$ docker-compose ps

# Para parar o banco de dados
$ npm run db:down

# Para resetar o banco (apaga todos os dados)
$ npm run db:reset
```

**Credenciais do banco (já configuradas no .env):**
- **Host**: localhost
- **Port**: 5432
- **Database**: loomi_db
- **User**: loomi_user
- **Password**: loomi_password

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
```

💡 **Dica:** Use o arquivo `apps/clients/src/users/users.http` com a extensão REST Client do VSCode para testar os endpoints.

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

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

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
