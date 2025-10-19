# 🚀 Desafio Loomi - Sistema de Gestão de Clientes e Transações

Sistema de microserviços desenvolvido com NestJS para gerenciamento de clientes e transações financeiras, utilizando arquitetura baseada em mensageria com RabbitMQ.

## 📋 Sobre o Projeto

Este projeto implementa uma solução de microserviços para gestão de clientes e transações bancárias. A arquitetura é composta por dois serviços principais que se comunicam de forma assíncrona através do RabbitMQ, garantindo escalabilidade e desacoplamento.

### ✨ Funcionalidades Principais

**Serviço de Clientes (`clients-app`)**
- ✅ Cadastro, atualização e exclusão de clientes
- ✅ Validação de CPF com algoritmo verificador
- ✅ Upload de foto de perfil
- ✅ Gerenciamento de dados bancários (agência, conta)
- ✅ Cache com Redis para otimização de consultas
- ✅ Documentação automática com Swagger

**Serviço de Transações (`transactions-app`)**
- ✅ Criação e gerenciamento de transações (crédito, débito, transferência)
- ✅ Validação de saldos e regras de negócio
- ✅ Notificações assíncronas via RabbitMQ
- ✅ Histórico completo de transações
- ✅ Cache de dados frequentes
- ✅ Documentação automática com Swagger

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                      LOOMI SYSTEM                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │  Clients API     │         │ Transactions API │          │
│  │  (Port 3001)     │         │  (Port 3002)     │          │
│  └────────┬─────────┘         └────────┬─────────┘          │
│           │                            │                    │
│           ├────────────┬───────────────┤                    │
│           │            │               │                    │
│      ┌────▼─────┐  ┌───▼────┐     ┌───▼─────┐               │
│      │PostgreSQL│  │ Redis  │     │RabbitMQ │               │
│      │(5432)    │  │ (6379) │     │(5672)   │               │
│      └──────────┘  └────────┘     └─────────┘               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ Tecnologias Utilizadas

- **Framework:** NestJS 11.x
- **Linguagem:** TypeScript 5.7.x
- **Banco de Dados:** PostgreSQL 16 (Alpine)
- **ORM:** Prisma 6.17.x
- **Cache:** Redis 7 (Alpine)
- **Mensageria:** RabbitMQ 3.13 (Management)
- **Documentação:** Swagger/OpenAPI
- **Containerização:** Docker & Docker Compose
- **Validação:** class-validator & class-transformer

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [Docker](https://www.docker.com/get-started) (versão 20.x ou superior)
- [Docker Compose](https://docs.docker.com/compose/install/) (versão 2.x ou superior)

## 🚀 Como Rodar o Projeto com Docker

### Opção 1: Comando Rápido

```bash
npm run docker:start
```

Este comando irá:
1. Construir as imagens Docker dos serviços
2. Subir todos os containers (PostgreSQL, Redis, RabbitMQ, Clients API, Transactions API)
3. Executar as migrations do banco de dados automaticamente
4. Exibir as URLs de acesso aos serviços

### Opção 2: Docker Compose Manual

```bash
# Subir todos os serviços
docker-compose up --build -d

# Ver logs em tempo real
docker-compose logs -f

# Ver status dos containers
docker-compose ps
```

### 🔍 Verificando a Instalação

Após executar o comando, você verá uma mensagem similar a:

```
╔════════════════════════════════════════════════════════════════╗
║           🚀 Loomi - Sistema Iniciado com Sucesso!           ║
╚════════════════════════════════════════════════════════════════╝

📡 APIs REST:
   → Clients API ......... http://localhost:3001/api/users
   → Transactions API .... http://localhost:3002/api/transactions

📚 Documentação Swagger:
   → Clients API ......... http://localhost:3001/api/docs/users
   → Transactions API .... http://localhost:3002/api/docs/transactions

🔧 Infraestrutura:
   → PostgreSQL .......... localhost:5432 (loomi_user/loomi_password)
   → Redis ............... localhost:6379
   → RabbitMQ ............ localhost:5672
   → RabbitMQ UI ......... http://localhost:15672 (loomi_user/loomi_password)

💡 Comandos Úteis:
   → Ver status .......... npm run docker:ps
   → Ver logs ............ npm run docker:logs
   → Reiniciar ........... npm run docker:restart
   → Parar tudo .......... npm run docker:stop
   → Limpar tudo ......... npm run docker:clean

✨ Dica: Acesse o Swagger para testar os endpoints interativamente!
```

## 📚 Documentação da API

Após iniciar os serviços, a documentação Swagger estará disponível em:

- **Clients API:** http://localhost:3001/api/docs/users
- **Transactions API:** http://localhost:3002/api/docs/transactions

### 🎯 Como usar o Swagger

A documentação Swagger agora inclui:
- ✅ Autenticação integrada (X-API-Key e Bearer)
- ✅ Descrições detalhadas de cada endpoint
- ✅ Exemplos de requisições e respostas
- ✅ Informações sobre rate limiting e segurança
- ✅ Schemas interativos com validações

**📖 Guia completo:** [Como usar o Swagger](docs/SWAGGER_GUIDE.md)

## 🔒 Segurança

O projeto implementa múltiplas camadas de segurança:

### Funcionalidades de Segurança

- ✅ **Helmet**: Headers HTTP seguros (CSP, HSTS, XSS Protection)
- ✅ **CORS**: Controle de acesso de origens
- ✅ **Rate Limiting**: Proteção contra DDoS (10/seg, 100/min, 1000/hora)
- ✅ **API Key Authentication**: Controle de acesso via chave de API
- ✅ **Input Sanitization**: Limpeza automática de dados
- ✅ **Security Logging**: Auditoria completa de requisições
- ✅ **Validation**: Validação estrita de DTOs

### Usando API Key

```bash
# Todas as requisições requerem API Key (exceto rotas marcadas como @Public())

# Desenvolvimento - API Keys
loomi-dev-key-123
loomi-dev-key-456

# Exemplo de uso
curl -H "X-API-Key: loomi-dev-key-123" http://localhost:3001/api/users
```

### Testes de Segurança

**⚠️ IMPORTANTE:** Antes de executar os testes, certifique-se de que as migrations foram aplicadas:

```bash
# 1. Aplicar migrations no banco de dados
docker exec loomi-clients-app npx prisma migrate deploy

# 2. Executar suite completa de testes de segurança
npm run test:security

# 3. Testar na AWS (se aplicável)
v
```

**Nota:** Os testes incluem verificação de rate limiting, portanto o script aguarda 60 segundos entre alguns testes para garantir resultados precisos.

### Documentação Completa

- 📖 [Como usar o Swagger](docs/SWAGGER_GUIDE.md)
- 📖 [Guia Completo de Segurança](docs/SECURITY.md)
- 📖 [Troubleshooting de Testes](docs/TROUBLESHOOTING_TESTS.md)

## 🔌 Endpoints Principais

### Clients API (Port 3001)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/users` | Criar novo cliente |
| GET | `/api/users` | Listar todos os clientes |
| GET | `/api/users/:id` | Buscar cliente por ID |
| PATCH | `/api/users/:id` | Atualizar dados do cliente |
| PATCH | `/api/users/:id/profile-picture` | Atualizar foto de perfil |
| DELETE | `/api/users/:id` | Excluir cliente |

### Transactions API (Port 3002)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/transactions` | Criar nova transação |
| GET | `/api/transactions` | Listar todas as transações |
| GET | `/api/transactions/:id` | Buscar transação por ID |
| GET | `/api/transactions/user/:userId` | Transações de um usuário |
| PATCH | `/api/transactions/:id` | Atualizar transação |
| DELETE | `/api/transactions/:id` | Cancelar transação |

## 🗄️ Serviços e Portas

| Serviço | Porta | Credenciais |
|---------|-------|-------------|
| PostgreSQL | 5432 | `loomi_user / loomi_password` |
| Redis | 6379 | - |
| RabbitMQ AMQP | 5672 | `loomi_user / loomi_password` |
| RabbitMQ Management | 15672 | `loomi_user / loomi_password` |
| Clients API | 3001 | - |
| Transactions API | 3002 | - |

## ☁️ Deploy na AWS

### 🚀 Quick Start AWS

Para fazer deploy completo na AWS (ECS Fargate + RDS + ElastiCache + Amazon MQ):

```bash
# 1. Configurar credenciais AWS
aws configure

# 2. Configurar variáveis
cp terraform/terraform.tfvars.example terraform/terraform.tfvars
nano terraform/terraform.tfvars  # Altere as senhas!

# 3. Deploy completo
npm run aws:deploy
```

**Tempo estimado**: 15-20 minutos  
**Custo estimado**: ~$170/mês

### Scripts AWS Disponíveis

```bash
# Deploy e Atualizações
npm run aws:deploy              # Deploy completo
npm run aws:update              # Atualizar apenas código
npm run aws:update:clients      # Atualizar só Clients
npm run aws:update:transactions # Atualizar só Transactions

# Monitoramento
npm run aws:status              # Status dos serviços
npm run aws:logs:clients        # Logs do Clients
npm run aws:logs:transactions   # Logs do Transactions

# Destruir infraestrutura
npm run aws:destroy             # ⚠️ Remove tudo da AWS
```

## 🎯 Scripts NPM Disponíveis

```bash
# Docker (Desenvolvimento Local)
npm run docker:start      # Iniciar todos os serviços
npm run docker:stop       # Parar todos os serviços
npm run docker:restart    # Reiniciar os serviços
npm run docker:logs       # Ver logs em tempo real
npm run docker:ps         # Ver status dos containers
npm run docker:clean      # Remover containers, volumes e imagens

# Prisma
npm run prisma:generate   # Gerar Prisma Client
npm run prisma:migrate    # Executar migrations
npm run prisma:studio     # Abrir Prisma Studio

# Desenvolvimento Local (sem Docker)
npm run start:clients:dev       # Clients API em modo dev
npm run start:transactions:dev  # Transactions API em modo dev

# Testes
npm run test                    # Executar testes unitários
npm run test:watch              # Executar testes em modo watch
npm run test:cov                # Executar testes com cobertura
npm run test:cov:open           # Gerar cobertura e abrir no navegador
npm run test:cov:show           # Abrir relatório de cobertura existente
npm run test:e2e:clients        # Testes E2E do serviço de clientes
npm run test:e2e:transactions   # Testes E2E do serviço de transações
```

## 🔧 Variáveis de Ambiente

As variáveis de ambiente já estão configuradas no `docker-compose.yml`. Para desenvolvimento local, você pode criar um arquivo `.env`:

```env
# Database
DATABASE_URL="postgresql://loomi_user:loomi_password@localhost:5432/loomi_db?schema=public"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# RabbitMQ
RABBITMQ_URL=amqp://loomi_user:loomi_password@localhost:5672

# Node
NODE_ENV=development
```

## 🛑 Parando os Serviços

```bash
# Parar todos os containers
npm run docker:stop

# Ou usar docker-compose diretamente
docker-compose down

# Para remover volumes e dados persistidos
npm run docker:clean
```

## 📊 Monitoramento

### RabbitMQ Management UI

Acesse http://localhost:15672 para monitorar:
- Filas de mensagens
- Conexões ativas
- Taxa de mensagens
- Estatísticas gerais

**Login:** `loomi_user` / `loomi_password`

### Logs dos Serviços

```bash
# Ver logs de todos os serviços
npm run docker:logs

# Ver logs de um serviço específico
docker-compose logs -f clients-app
docker-compose logs -f transactions-app
docker-compose logs -f rabbitmq
```

## 🏥 Health Checks

Todos os serviços possuem health checks configurados:

- **PostgreSQL:** Verifica conexão a cada 10s
- **Redis:** Ping a cada 10s
- **RabbitMQ:** Diagnostics a cada 10s
- **APIs:** Health endpoint a cada 30s

## 🧪 Testes

O projeto possui uma suíte completa de testes unitários com alta cobertura de código.

### 📊 Cobertura Atual

| Componente | Cobertura | Testes |
|------------|-----------|--------|
| **Controllers** | 100% ✅ | 23 testes |
| **Services** | 96%+ ✅ | 45 testes |
| **Total** | 87%+ | 68 testes |

### 🎯 Funcionalidades Testadas

#### ClientsController & UsersService
- ✅ Criação, listagem, busca, atualização e remoção de usuários
- ✅ Validação de UUID nos parâmetros de rota
- ✅ Validação de corpo vazio nas requisições
- ✅ Atualização de foto de perfil
- ✅ Emissão de eventos RabbitMQ para dados bancários
- ✅ Gerenciamento de cache (invalidação)
- ✅ Tratamento de erros (NotFoundException, BadRequestException)

#### TransactionsController & TransactionsService
- ✅ Criação de transações (crédito, débito, transferência)
- ✅ Validação de regras de negócio por tipo de transação
- ✅ Validação de existência de usuários
- ✅ Listagem e busca de transações
- ✅ Envio de notificações via RabbitMQ
- ✅ Processamento de eventos de atualização bancária
- ✅ Tratamento completo de erros

### 🚀 Executando os Testes

```bash
# Testes básicos
npm run test                    # Executar todos os testes
npm run test:watch              # Modo watch (re-executa ao salvar)

# Com cobertura
npm run test:cov                # Gerar relatório de cobertura
npm run test:cov:open           # Gerar e abrir no navegador
npm run test:cov:show           # Abrir relatório existente (rápido)

# Testes E2E
npm run test:e2e:clients        # End-to-end do serviço clients
npm run test:e2e:transactions   # End-to-end do serviço transactions
```

### 📈 Visualizando a Cobertura

Após executar `npm run test:cov:open` ou `npm run test:cov:show`, você verá um relatório HTML interativo com:
- Porcentagem de cobertura por arquivo
- Linhas testadas vs não testadas (verde/vermelho)
- Métricas detalhadas (Statements, Branches, Functions, Lines)

## 📝 Estrutura do Projeto

```
desafio-loomi-nestjs/
├── apps/
│   ├── clients/              # Microserviço de Clientes
│   │   ├── src/
│   │   │   ├── users/        # Módulo de usuários
│   │   │   │   ├── dto/      # Data Transfer Objects
│   │   │   │   ├── entities/ # Entidades
│   │   │   │   └── validators/ # Validadores customizados
│   │   │   └── main.ts
│   │   └── Dockerfile
│   │
│   └── transactions/         # Microserviço de Transações
│       ├── src/
│       │   ├── transactions/ # Módulo de transações
│       │   │   ├── dto/
│       │   │   └── entities/
│       │   ├── services/     # Serviço de notificações
│       │   └── main.ts
│       └── Dockerfile
│
├── libs/
│   ├── common/               # Utilitários compartilhados
│   │   └── pipes/            # Pipes customizados (validação UUID)
│   └── prisma/               # Biblioteca compartilhada do Prisma
│
├── prisma/
│   ├── migrations/           # Migrations do banco de dados
│   └── schema.prisma         # Schema do Prisma
│
├── coverage/                 # Relatórios de cobertura de testes
├── docker-compose.yml        # Configuração Docker
└── package.json
```

## ✨ Qualidade e Boas Práticas

### Validações Implementadas
- ✅ **Validação de UUID:** Todos os IDs são validados com regex UUID v4
- ✅ **Validação de Body:** Requisições vazias retornam erro apropriado
- ✅ **Validação de CPF:** Algoritmo verificador completo
- ✅ **Validação de DTOs:** class-validator em todos os endpoints

### Tratamento de Erros
- ✅ **BadRequestException:** Dados inválidos, UUIDs malformados, bodies vazios
- ✅ **NotFoundException:** Recursos não encontrados
- ✅ **Mensagens claras:** Erros descritivos em português

### Performance
- ✅ **Cache com Redis:** Otimização de queries frequentes
- ✅ **Invalidação inteligente:** Cache limpo após modificações
- ✅ **Índices no banco:** Otimização de consultas

### Arquitetura
- ✅ **Microserviços:** Separação clara de responsabilidades
- ✅ **Event-Driven:** Comunicação assíncrona via RabbitMQ
- ✅ **SOLID:** Princípios aplicados em toda a base de código
- ✅ **DRY:** Reutilização de código com libs compartilhadas

## 📄 Licença

Este projeto é privado e faz parte do processo seletivo da Loomi.

---

**Desenvolvido com ❤️ por Jones Torres usando NestJS**

