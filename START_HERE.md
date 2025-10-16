# 🚀 Como Rodar o Projeto

## ⭐ Forma Mais Simples - Um Único Comando

Execute apenas **2 comandos** e tudo estará funcionando:

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar TUDO com Docker
npm run docker:start
```

Isso irá:
- ✅ Fazer build das aplicações
- ✅ Iniciar PostgreSQL
- ✅ Iniciar Redis  
- ✅ Iniciar RabbitMQ
- ✅ Iniciar App Clients (porta 3001)
- ✅ Iniciar App Transactions (porta 3002)

Aguarde ~1-2 minutos para o build e inicialização. Quando terminar, você terá:

| Serviço | URL | Status |
|---------|-----|--------|
| **Clients API** | http://localhost:3001/api/users | ✅ |
| **Transactions API** | http://localhost:3002/api/transactions | ✅ |
| **RabbitMQ UI** | http://localhost:15672 | ✅ |
| **PostgreSQL** | localhost:5432 | ✅ |
| **Redis** | localhost:6379 | ✅ |

**Credenciais RabbitMQ UI:** loomi_user / loomi_password

### 🔧 Primeira Execução? Aplique as Migrações

```bash
# Apenas na primeira vez que rodar o projeto
docker-compose exec clients-app npx prisma migrate deploy
```

Pronto! Agora você pode testar a API:

```bash
# Criar um usuário
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "João Silva", "email": "joao@example.com"}'
```

### 📊 Ver Status dos Containers

```bash
npm run docker:ps
```

### 📝 Ver Logs em Tempo Real

```bash
npm run docker:logs

# Ou apenas de um serviço específico:
docker-compose logs -f clients-app
docker-compose logs -f transactions-app
```

### 🛑 Parar Tudo

```bash
npm run docker:stop
```

### 🔄 Reiniciar

```bash
npm run docker:restart
```

---

## Opção 2: Docker para Infra + Apps Localmente

Se preferir desenvolver localmente com hot-reload:

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar apenas PostgreSQL e Redis
docker-compose up -d postgres redis

# 3. Aplicar migrações
npm run prisma:migrate:deploy

# 4. Iniciar Clients App (Terminal 1)
npm run start:clients:dev

# 5. Iniciar Transactions App (Terminal 2)
npm run start:transactions:dev
```

---

## 🧪 Testar a API

### Com cURL:

```bash
# Criar usuário
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com"
  }'

# Listar usuários
curl http://localhost:3001/api/users
```

### Com arquivos .http (VSCode REST Client):

- `apps/clients/src/users/users.http`
- `apps/transactions/src/transactions/transactions.http`

---

## 📊 Verificar se está tudo funcionando

```bash
# Ver status dos containers
npm run docker:ps

# Deve mostrar algo como:
# loomi-postgres          Up (healthy)
# loomi-redis             Up (healthy)
# loomi-rabbitmq          Up (healthy)
# loomi-clients-app       Up (healthy)
# loomi-transactions-app  Up (healthy)
```

---

## 🛑 Parar Tudo

```bash
npm run docker:stop
```

---

## 🧹 Resetar Tudo (apaga dados do banco)

```bash
npm run docker:clean
npm install
npm run docker:start
docker-compose exec clients-app npx prisma migrate deploy
```

---

## ❓ Problemas?

### Container não inicia:
```bash
docker-compose logs clients-app
```

### Resetar um serviço específico:
```bash
docker-compose restart clients-app
```

### Build novamente:
```bash
docker-compose up --build -d clients-app
```

---

## 📖 Documentação Completa

Para mais detalhes, veja:
- `README.md` - Documentação principal
- `TRANSACTIONS_API.md` - Documentação da API de transações

