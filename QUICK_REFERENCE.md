# Referência Rápida - Comandos

## 🚀 Setup Inicial

```bash
npm run setup
```

## 📦 Instalação

```bash
npm install
```

## 🐳 Docker

### Desenvolvimento (apenas infraestrutura)
```bash
npm run docker:dev:up      # Inicia postgres, redis, rabbitmq
npm run docker:dev:down    # Para infraestrutura
npm run docker:dev:logs    # Ver logs
```

### Produção (todos os serviços)
```bash
npm run docker:up          # Build e inicia tudo
npm run docker:down        # Para tudo
npm run docker:ps          # Status dos containers
npm run docker:logs        # Ver logs
npm run docker:restart     # Reiniciar
npm run docker:clean       # Limpar tudo
```

## 🗄️ Prisma

```bash
npm run prisma:generate           # Gerar Prisma Client
npm run prisma:migrate            # Criar e aplicar migração
npm run prisma:migrate:deploy    # Aplicar migrações (prod)
npm run prisma:studio             # Abrir Prisma Studio
npm run prisma:format             # Formatar schema
```

## 🚀 Aplicações

### Clients (Porta 3001)
```bash
npm run start:clients            # Iniciar
npm run start:clients:dev        # Modo watch
npm run start:clients:debug      # Modo debug
npm run start:clients:prod       # Produção
npm run build:clients            # Build
```

### Transactions (Porta 3002)
```bash
npm run start:transactions       # Iniciar
npm run start:transactions:dev   # Modo watch
npm run start:transactions:debug # Modo debug
npm run start:transactions:prod  # Produção
npm run build:transactions       # Build
```

### Ambas
```bash
npm run build                    # Build de todas
```

## 🧪 Testes

```bash
npm run test                     # Testes unitários
npm run test:watch               # Modo watch
npm run test:cov                 # Com cobertura
npm run test:e2e:clients         # E2E clients
npm run test:e2e:transactions    # E2E transactions
```

## 🔍 Qualidade de Código

```bash
npm run lint                     # Lint e fix
npm run format                   # Formatar código
```

## 🌐 Endpoints

### Clients App (3001)

```bash
GET    /api/users                # Listar usuários
GET    /api/users/:id            # Buscar usuário
POST   /api/users                # Criar usuário
PATCH  /api/users/:id            # Atualizar usuário
DELETE /api/users/:id            # Deletar usuário
```

### Transactions App (3002)

```bash
GET    /api/transactions                # Listar transações
GET    /api/transactions/:id            # Buscar transação
GET    /api/transactions/user/:userId   # Transações do usuário
POST   /api/transactions                # Criar transação
PATCH  /api/transactions/:id            # Atualizar transação
DELETE /api/transactions/:id            # Deletar transação
```

## 🔧 Serviços

### PostgreSQL
```bash
docker exec -it loomi-postgres psql -U loomi_user -d loomi_db
```

### Redis
```bash
docker exec -it loomi-redis redis-cli
# KEYS *
# GET "/api/users"
# FLUSHALL
```

### RabbitMQ
```
Management UI: http://localhost:15672
User: loomi_user
Pass: loomi_password
```

## 📊 Monitoramento

```bash
docker-compose ps                # Status
docker-compose logs -f           # Logs em tempo real
docker stats                     # Recursos (CPU/RAM)
```

## 🧹 Limpeza

```bash
docker-compose down              # Parar
docker-compose down -v           # Parar + remover volumes
docker-compose down -v --rmi all # Limpar tudo
```

## 🆘 Troubleshooting

### Container não inicia
```bash
docker-compose logs <service-name>
docker-compose ps
```

### Rebuild completo
```bash
docker-compose build --no-cache
docker-compose up -d
```

### Aplicar migrações em container
```bash
docker-compose exec clients-app npx prisma migrate deploy
```

### Resetar tudo
```bash
npm run docker:clean
npm run setup
```

## 📚 Documentação

- `README.md` - Documentação principal
- `DOCKER.md` - Guia completo do Docker
- `TRANSACTIONS_API.md` - API de transações (POST)
- `TRANSACTIONS_GET_API.md` - API de transações (GET)
- `apps/clients/src/users/users.http` - Testes API Users
- `apps/transactions/src/transactions/transactions.http` - Testes API Transactions

## 🔗 URLs Importantes

| Serviço | URL | Credenciais |
|---------|-----|-------------|
| Clients API | http://localhost:3001 | - |
| Transactions API | http://localhost:3002 | - |
| Prisma Studio | http://localhost:5555 | - |
| RabbitMQ UI | http://localhost:15672 | loomi_user / loomi_password |
| PostgreSQL | localhost:5432 | loomi_user / loomi_password |
| Redis | localhost:6379 | - |

