# Guia de Teste - Integração RabbitMQ

Este guia mostra como testar a comunicação assíncrona entre os apps clients e transactions via RabbitMQ.

## 🎯 O que será testado

Quando um usuário tem seus **dados bancários atualizados** no app **clients**, um evento `user_banking_updated` é emitido para o RabbitMQ e consumido pelo app **transactions**.

## 📋 Pré-requisitos

1. Docker instalado e rodando
2. Node.js e npm instalados
3. Dependências do projeto instaladas

## 🚀 Passo a Passo

### 1. Iniciar Infraestrutura

```bash
# Iniciar PostgreSQL, Redis e RabbitMQ
npm run docker:dev:up

# Verificar se os serviços estão rodando
docker-compose -f docker-compose.dev.yml ps

# Deve mostrar:
# loomi-postgres-dev    Up (healthy)
# loomi-redis-dev       Up (healthy)
# loomi-rabbitmq-dev    Up (healthy)
```

### 2. Aplicar Migrações

```bash
# Gerar Prisma Client
npm run prisma:generate

# Aplicar migrações
npm run prisma:migrate:deploy
```

### 3. Iniciar Aplicações

**Terminal 1 - Clients App:**
```bash
npm run start:clients:dev
```

Aguarde até ver:
```
🚀 Clients app is running on: http://localhost:3001
```

**Terminal 2 - Transactions App:**
```bash
npm run start:transactions:dev
```

Aguarde até ver:
```
🐰 RabbitMQ microservice is listening...
🚀 Transactions app is running on: http://localhost:3002
```

### 4. Criar um Usuário

**Terminal 3:**

```bash
# Criar usuário de teste
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao.silva@example.com",
    "cpf": "123.456.789-00",
    "phone": "(11) 98765-4321",
    "address": "Rua das Flores, 123",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01234-567"
  }'
```

**Copie o `id` do usuário retornado.**

### 5. Atualizar Dados Bancários (Dispara Evento)

```bash
# Substitua USER_ID pelo ID copiado
export USER_ID="cole-o-id-aqui"

# Atualizar nome e email
curl -X PATCH http://localhost:3001/api/users/$USER_ID \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva Atualizado",
    "email": "joao.novo@example.com"
  }'
```

### 6. Verificar Logs

**No Terminal 1 (Clients App), você deve ver:**
```
📤 Evento 'user_banking_updated' emitido para o usuário 123e4567-e89b-12d3-a456-426614174000
```

**No Terminal 2 (Transactions App), você deve ver:**
```
📥 Evento recebido: user_banking_updated
📋 Dados do evento: {
  userId: '123e4567-e89b-12d3-a456-426614174000',
  name: 'João Silva Atualizado',
  email: 'joao.novo@example.com',
  cpf: '123.456.789-00',
  updatedFields: [ 'name', 'email' ],
  timestamp: '2024-10-15T15:30:00.000Z'
}
✅ Usuário João Silva Atualizado possui 0 transação(ões)
```

### 7. Verificar no RabbitMQ UI

1. Acesse: http://localhost:15672
2. Login: `loomi_user` / `loomi_password`
3. Clique em **Queues**
4. Procure por `user_events_queue`
5. Você deve ver:
   - **Total**: 1 mensagem processada
   - **Rate**: Taxa de processamento

## 🧪 Testes Adicionais

### Teste 1: Atualizar Múltiplos Campos

```bash
curl -X PATCH http://localhost:3001/api/users/$USER_ID \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Santos",
    "phone": "(21) 98765-4321",
    "address": "Avenida Paulista, 1000",
    "city": "São Paulo",
    "state": "SP"
  }'
```

**Verifique nos logs do Transactions:**
- `updatedFields` deve conter: `['name', 'phone', 'address', 'city', 'state']`

### Teste 2: Criar Transação e Ver no Evento

```bash
# 1. Criar uma transação para o usuário
curl -X POST http://localhost:3002/api/transactions \
  -H "Content-Type: application/json" \
  -d "{
    \"amount\": 100.00,
    \"type\": \"credit\",
    \"status\": \"completed\",
    \"userId\": \"$USER_ID\"
  }"

# 2. Atualizar usuário novamente
curl -X PATCH http://localhost:3001/api/users/$USER_ID \
  -H "Content-Type: application/json" \
  -d '{"name": "João com Transação"}'
```

**Verifique nos logs do Transactions:**
- Deve mostrar: `✅ Usuário João com Transação possui 1 transação(ões)`

### Teste 3: Atualizar Apenas CPF (Sensível)

```bash
curl -X PATCH http://localhost:3001/api/users/$USER_ID \
  -H "Content-Type: application/json" \
  -d '{
    "cpf": "999.888.777-66"
  }'
```

**Deve disparar evento mesmo sendo apenas um campo.**

### Teste 4: Performance - Múltiplas Atualizações

```bash
# Script para testar múltiplas atualizações
for i in {1..5}; do
  curl -X PATCH http://localhost:3001/api/users/$USER_ID \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"Update $i\"}"
  sleep 1
done
```

**Verifique:**
- Transactions App deve receber 5 eventos
- RabbitMQ UI deve mostrar 5 mensagens processadas

## 🔍 Verificações

### 1. Queue Criada

```bash
docker exec -it loomi-rabbitmq-dev rabbitmqctl list_queues

# Deve mostrar:
# user_events_queue    0
```

### 2. Conexões Ativas

```bash
docker exec -it loomi-rabbitmq-dev rabbitmqctl list_connections

# Deve mostrar 2 conexões:
# - Clients App (producer)
# - Transactions App (consumer)
```

### 3. Mensagens Processadas

No RabbitMQ UI (http://localhost:15672):

**Queues > user_events_queue:**
- Ready: 0 (mensagens aguardando)
- Unacked: 0 (mensagens sendo processadas)
- Total: N (total de mensagens processadas)

## ❌ Troubleshooting

### Evento não é recebido

**1. Verificar se RabbitMQ está rodando:**
```bash
docker ps | grep rabbitmq
```

**2. Verificar logs do RabbitMQ:**
```bash
docker logs loomi-rabbitmq-dev
```

**3. Verificar se Transactions App conectou:**
```bash
# Deve aparecer no log do Transactions:
# 🐰 RabbitMQ microservice is listening...
```

**4. Verificar variável de ambiente:**
```bash
echo $RABBITMQ_URL
# ou verificar no .env
cat .env | grep RABBITMQ
```

### Evento recebido mas não processado

**1. Verificar estrutura do payload:**
- Interface `UserBankingUpdatedEvent` deve corresponder ao emitido

**2. Verificar erros nos logs:**
```
❌ Erro ao processar evento: ...
```

**3. Verificar se usuário existe:**
- Evento contém userId válido

### RabbitMQ Connection Refused

**1. Verificar se RabbitMQ está pronto:**
```bash
docker exec -it loomi-rabbitmq-dev rabbitmq-diagnostics ping
# Deve retornar: Ping succeeded
```

**2. Reiniciar containers:**
```bash
npm run docker:dev:down
npm run docker:dev:up
```

## 📊 Casos de Teste

### ✅ Deve Disparar Evento

| Ação | Campos Atualizados | Evento? |
|------|-------------------|---------|
| PATCH /api/users/:id | name | ✅ Sim |
| PATCH /api/users/:id | email | ✅ Sim |
| PATCH /api/users/:id | cpf | ✅ Sim |
| PATCH /api/users/:id | phone | ✅ Sim |
| PATCH /api/users/:id | address, city, state, zipCode | ✅ Sim |
| PATCH /api/users/:id | name, email, cpf | ✅ Sim |

### ❌ Não Deve Disparar Evento

| Ação | Motivo |
|------|--------|
| POST /api/users | Criação não dispara evento (apenas atualização) |
| DELETE /api/users/:id | Deleção não dispara evento |
| GET /api/users/:id | Consulta não dispara evento |

## 🎯 Resultado Esperado

Após executar o teste completo, você deve ter:

1. ✅ Usuário criado no banco
2. ✅ Usuário atualizado com novos dados
3. ✅ Evento emitido pelo Clients App
4. ✅ Evento recebido pelo Transactions App
5. ✅ Logs mostrando o fluxo completo
6. ✅ RabbitMQ UI mostrando mensagens processadas
7. ✅ Cache invalidado no Clients App

## 📈 Próximos Passos

Após confirmar que a integração funciona:

1. Implementar casos de uso reais:
   - Auditoria de alterações
   - Notificações por email
   - Webhooks para sistemas externos

2. Adicionar mais eventos:
   - `user_created`
   - `user_deleted`
   - `transaction_created`
   - `transaction_status_changed`

3. Implementar padrões avançados:
   - Request-Response
   - Sagas para transações distribuídas
   - CQRS

## 🔗 Referências

- `RABBITMQ_INTEGRATION.md` - Documentação completa
- `apps/clients/src/users/users.http` - Testes HTTP
- http://localhost:15672 - RabbitMQ UI

