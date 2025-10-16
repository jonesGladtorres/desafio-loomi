# Guia Docker - Desafio Loomi

Este documento descreve a arquitetura Docker do projeto e como usar os containers.

## Arquitetura

O projeto possui uma arquitetura de microserviços containerizados:

```
┌─────────────────────────────────────────────────────────────┐
│                     loomi-network                           │
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│  │              │    │              │    │              │ │
│  │   Clients    │    │ Transactions │    │  PostgreSQL  │ │
│  │   App        │───▶│     App      │───▶│              │ │
│  │  (Port 3001) │    │  (Port 3002) │    │  (Port 5432) │ │
│  │              │    │              │    │              │ │
│  └──────┬───────┘    └──────┬───────┘    └──────────────┘ │
│         │                   │                              │
│         │    ┌──────────────┴──────────────┐              │
│         │    │                              │              │
│         ▼    ▼                              ▼              │
│  ┌──────────────┐              ┌──────────────┐           │
│  │              │              │              │           │
│  │    Redis     │              │   RabbitMQ   │           │
│  │  (Port 6379) │              │  (Port 5672) │           │
│  │              │              │ Management:  │           │
│  └──────────────┘              │  Port 15672  │           │
│                                └──────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

## Serviços

### 1. PostgreSQL (`postgres`)

**Imagem**: `postgres:16-alpine`
**Porta**: 5432
**Container**: `loomi-postgres`

Base de dados relacional para armazenar usuários e transações.

**Credenciais:**
- User: `loomi_user`
- Password: `loomi_password`
- Database: `loomi_db`

### 2. Redis (`redis`)

**Imagem**: `redis:7-alpine`
**Porta**: 6379
**Container**: `loomi-redis`

Cache em memória para otimizar performance do app clients.

### 3. RabbitMQ (`rabbitmq`)

**Imagem**: `rabbitmq:3.13-management-alpine`
**Portas**: 
- 5672 (AMQP)
- 15672 (Management UI)

**Container**: `loomi-rabbitmq`

Message broker para comunicação assíncrona entre serviços.

**Credenciais:**
- User: `loomi_user`
- Password: `loomi_password`

**Management UI**: http://localhost:15672

### 4. Clients App (`clients-app`)

**Build**: Multi-stage com Node 20 Alpine
**Porta**: 3001
**Container**: `loomi-clients-app`

Aplicação de gerenciamento de clientes.

**Características:**
- ✅ Build otimizado em duas etapas
- ✅ Usuário não-root para segurança
- ✅ Health check configurado
- ✅ Aguarda serviços dependentes ficarem saudáveis

### 5. Transactions App (`transactions-app`)

**Build**: Multi-stage com Node 20 Alpine
**Porta**: 3002
**Container**: `loomi-transactions-app`

Aplicação de gerenciamento de transações.

**Características:**
- ✅ Build otimizado em duas etapas
- ✅ Usuário não-root para segurança
- ✅ Health check configurado
- ✅ Aguarda serviços dependentes ficarem saudáveis

## Dockerfiles

### Estrutura Multi-Stage

Ambos os Dockerfiles usam build multi-stage para otimização:

#### Stage 1: Builder
- Base: `node:20-alpine`
- Instala dependências
- Copia código fonte
- Gera Prisma Client
- Faz build da aplicação

#### Stage 2: Production
- Base: `node:20-alpine`
- Copia apenas artefatos necessários
- Gera Prisma Client novamente
- Cria usuário não-root
- Configura comando de inicialização

### Otimizações

1. ✅ **Multi-stage build**: Reduz tamanho final da imagem
2. ✅ **Alpine Linux**: Imagem base leve (~5MB)
3. ✅ **npm ci**: Instalação determinística de dependências
4. ✅ **Usuário não-root**: Melhor segurança
5. ✅ **Layer caching**: Otimiza rebuilds
6. ✅ **.dockerignore**: Exclui arquivos desnecessários

### Tamanho das Imagens

| Imagem | Tamanho Aproximado |
|--------|-------------------|
| clients-app | ~200-250 MB |
| transactions-app | ~200-250 MB |
| postgres:16-alpine | ~238 MB |
| redis:7-alpine | ~37 MB |
| rabbitmq:3.13-management-alpine | ~184 MB |

## Comandos

### Desenvolvimento (apenas serviços de infraestrutura)

```bash
# Iniciar apenas PostgreSQL, Redis e RabbitMQ
docker-compose -f docker-compose.dev.yml up -d

# Verificar status
docker-compose -f docker-compose.dev.yml ps

# Ver logs
docker-compose -f docker-compose.dev.yml logs -f

# Parar serviços
docker-compose -f docker-compose.dev.yml down

# Parar e remover dados
docker-compose -f docker-compose.dev.yml down -v
```

### Produção (todos os serviços)

```bash
# Build e iniciar todos os serviços
docker-compose up --build -d

# Iniciar sem rebuild
docker-compose up -d

# Verificar status de todos os containers
docker-compose ps

# Ver logs de todos os serviços
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f clients-app
docker-compose logs -f transactions-app

# Parar todos os serviços
docker-compose down

# Parar e remover volumes
docker-compose down -v

# Rebuild apenas uma aplicação
docker-compose build clients-app
docker-compose up -d clients-app
```

### Gerenciamento de Migrações

```bash
# Aplicar migrações (com containers rodando)
docker-compose exec clients-app npx prisma migrate deploy

# Ou usando o app transactions
docker-compose exec transactions-app npx prisma migrate deploy

# Gerar Prisma Client
docker-compose exec clients-app npx prisma generate
```

### Acesso aos Serviços

```bash
# Acessar PostgreSQL
docker-compose exec postgres psql -U loomi_user -d loomi_db

# Acessar Redis CLI
docker-compose exec redis redis-cli

# Verificar logs de um app
docker-compose logs -f clients-app

# Entrar no shell de um container
docker-compose exec clients-app sh
```

## Scripts NPM Atualizados

```bash
# Desenvolvimento (apenas infraestrutura)
npm run docker:dev:up      # Inicia postgres, redis, rabbitmq
npm run docker:dev:down    # Para infraestrutura

# Produção (todos os serviços)
npm run docker:up          # Build e inicia tudo
npm run docker:down        # Para tudo
npm run docker:restart     # Reinicia tudo
npm run docker:logs        # Ver logs
```

## Health Checks

Todos os serviços possuem health checks configurados:

### PostgreSQL
```yaml
test: ['CMD-SHELL', 'pg_isready -U loomi_user -d loomi_db']
interval: 10s
```

### Redis
```yaml
test: ['CMD', 'redis-cli', 'ping']
interval: 10s
```

### RabbitMQ
```yaml
test: ['CMD', 'rabbitmq-diagnostics', 'ping']
interval: 10s
```

### Clients App
```yaml
test: ['CMD', 'wget', '--quiet', '--tries=1', '--spider', 'http://localhost:3001/api/users']
interval: 30s
```

### Transactions App
```yaml
test: ['CMD', 'wget', '--quiet', '--tries=1', '--spider', 'http://localhost:3002/api/transactions']
interval: 30s
```

## Ordem de Inicialização

O Docker Compose garante a ordem correta:

```
1. postgres      ━━━┓
2. redis         ━━━┫━━▶ 5. clients-app
3. rabbitmq      ━━━┫━━▶ 6. transactions-app
                    ┗━━▶ (aguardam health checks)
```

Os apps só iniciam depois que todos os serviços de infraestrutura estiverem saudáveis.

## Networks

Todos os serviços compartilham a network `loomi-network`:

- ✅ Comunicação entre containers via nome do serviço
- ✅ Isolamento da rede host
- ✅ DNS automático

**Exemplo:**
```typescript
// No código, use o nome do serviço
DATABASE_URL: 'postgresql://loomi_user:loomi_password@postgres:5432/loomi_db'
REDIS_HOST: 'redis'
RABBITMQ_URL: 'amqp://loomi_user:loomi_password@rabbitmq:5672'
```

## Volumes

Dados persistidos em volumes Docker:

| Volume | Serviço | Conteúdo |
|--------|---------|----------|
| postgres_data | PostgreSQL | Dados do banco |
| redis_data | Redis | Snapshots do cache |
| rabbitmq_data | RabbitMQ | Mensagens e configurações |

### Gerenciar Volumes

```bash
# Listar volumes
docker volume ls | grep loomi

# Inspecionar um volume
docker volume inspect desafio-loomi-nestjs_postgres_data

# Remover volumes (CUIDADO: apaga os dados!)
docker-compose down -v
```

## Troubleshooting

### Container não inicia

```bash
# Ver logs
docker-compose logs clients-app

# Ver eventos
docker-compose events

# Verificar health
docker-compose ps
```

### Rebuild forçado

```bash
# Rebuild sem cache
docker-compose build --no-cache clients-app

# Rebuild tudo
docker-compose build --no-cache
```

### Limpar tudo

```bash
# Parar e remover tudo (containers, volumes, networks)
docker-compose down -v

# Remover imagens também
docker-compose down -v --rmi all
```

### Prisma não está funcionando

```bash
# Regenerar Prisma Client
docker-compose exec clients-app npx prisma generate

# Aplicar migrações
docker-compose exec clients-app npx prisma migrate deploy

# Ver schema
docker-compose exec clients-app cat prisma/schema.prisma
```

### App não conecta ao banco

1. Verificar se o PostgreSQL está healthy:
   ```bash
   docker-compose ps postgres
   ```

2. Verificar variáveis de ambiente:
   ```bash
   docker-compose exec clients-app env | grep DATABASE
   ```

3. Testar conexão manualmente:
   ```bash
   docker-compose exec postgres psql -U loomi_user -d loomi_db
   ```

## Variáveis de Ambiente

### Desenvolvimento (host)
```env
DATABASE_URL=postgresql://loomi_user:loomi_password@localhost:5432/loomi_db
REDIS_HOST=localhost
REDIS_PORT=6379
RABBITMQ_URL=amqp://loomi_user:loomi_password@localhost:5672
```

### Produção (containers)
```env
DATABASE_URL=postgresql://loomi_user:loomi_password@postgres:5432/loomi_db
REDIS_HOST=redis
REDIS_PORT=6379
RABBITMQ_URL=amqp://loomi_user:loomi_password@rabbitmq:5672
```

**Nota**: Os nomes mudam de `localhost` para o nome do serviço no Docker.

## Monitoramento

### RabbitMQ Management UI

Acesse: http://localhost:15672

**Credenciais:**
- Username: `loomi_user`
- Password: `loomi_password`

**Recursos:**
- Ver filas e exchanges
- Monitorar mensagens
- Gerenciar usuários e permissões
- Ver estatísticas de performance

### Logs em Tempo Real

```bash
# Todos os serviços
docker-compose logs -f

# Apenas apps
docker-compose logs -f clients-app transactions-app

# Com timestamps
docker-compose logs -f --timestamps
```

### Estatísticas de Recursos

```bash
# Ver uso de CPU e memória
docker stats

# Apenas containers do projeto
docker stats loomi-clients-app loomi-transactions-app
```

## Boas Práticas

1. ✅ **Use docker-compose.dev.yml** para desenvolvimento local
2. ✅ **Use docker-compose.yml** para produção/staging
3. ✅ **Sempre faça backup dos volumes** antes de `down -v`
4. ✅ **Monitore os health checks** para garantir disponibilidade
5. ✅ **Use networks** para isolar ambientes
6. ✅ **Configure resource limits** em produção
7. ✅ **Implemente logging estruturado** para melhor debugging

## Exemplo de Fluxo Completo

```bash
# 1. Build e iniciar todos os serviços
docker-compose up --build -d

# 2. Aguardar serviços ficarem healthy
docker-compose ps

# 3. Aplicar migrações
docker-compose exec clients-app npx prisma migrate deploy

# 4. Verificar se apps estão rodando
curl http://localhost:3001/api/users
curl http://localhost:3002/api/transactions

# 5. Ver logs
docker-compose logs -f clients-app

# 6. Parar quando terminar
docker-compose down
```

## Referências

- [Docker Multi-stage builds](https://docs.docker.com/build/building/multi-stage/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices#docker-best-practices)

