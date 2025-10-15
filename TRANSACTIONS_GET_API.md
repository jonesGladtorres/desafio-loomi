# Endpoints GET da API de Transações

Este documento detalha os endpoints GET para consulta de transações.

## GET /api/transactions/:transactionId

Busca uma transação específica pelo seu ID.

### URL
```
GET http://localhost:3002/api/transactions/{transactionId}
```

### Parâmetros

- **transactionId** (path parameter): UUID da transação

### Exemplo de Requisição

```bash
curl http://localhost:3002/api/transactions/987e6543-e21b-12d3-a456-426614174999
```

### Resposta de Sucesso (200 OK)

```json
{
  "id": "987e6543-e21b-12d3-a456-426614174999",
  "amount": "150.50",
  "type": "credit",
  "description": "Pagamento recebido",
  "status": "completed",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "createdAt": "2024-10-15T12:30:00.000Z",
  "updatedAt": "2024-10-15T12:30:00.000Z",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "João Silva",
    "email": "joao@example.com",
    "cpf": "123.456.789-00",
    "phone": "(11) 98765-4321",
    "address": "Rua das Flores, 123",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01234-567",
    "createdAt": "2024-10-15T10:00:00.000Z",
    "updatedAt": "2024-10-15T10:00:00.000Z"
  }
}
```

### Erros

#### Transação não encontrada (404 Not Found)

```json
{
  "statusCode": 404,
  "message": "Transaction with ID 00000000-0000-0000-0000-000000000000 not found",
  "error": "Not Found"
}
```

#### UUID inválido (pode variar)

```json
{
  "statusCode": 500,
  "message": "Invalid UUID format",
  "error": "Internal Server Error"
}
```

### Lógica do Service

```typescript
async findOne(id: string) {
  const transaction = await this.prisma.transaction.findUnique({
    where: { id },
    include: {
      user: true, // Inclui dados completos do usuário
    },
  });

  if (!transaction) {
    throw new NotFoundException(`Transaction with ID ${id} not found`);
  }

  return transaction;
}
```

---

## GET /api/transactions/user/:userId

Busca todas as transações de um usuário específico, ordenadas por data (mais recentes primeiro).

### URL
```
GET http://localhost:3002/api/transactions/user/{userId}
```

### Parâmetros

- **userId** (path parameter): UUID do usuário

### Exemplo de Requisição

```bash
curl http://localhost:3002/api/transactions/user/123e4567-e89b-12d3-a456-426614174000
```

### Resposta de Sucesso (200 OK)

```json
[
  {
    "id": "987e6543-e21b-12d3-a456-426614174999",
    "amount": "150.50",
    "type": "credit",
    "description": "Pagamento recebido",
    "status": "completed",
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "createdAt": "2024-10-15T12:30:00.000Z",
    "updatedAt": "2024-10-15T12:30:00.000Z",
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "João Silva",
      "email": "joao@example.com",
      "cpf": "123.456.789-00",
      "phone": "(11) 98765-4321",
      "address": "Rua das Flores, 123",
      "city": "São Paulo",
      "state": "SP",
      "zipCode": "01234-567",
      "createdAt": "2024-10-15T10:00:00.000Z",
      "updatedAt": "2024-10-15T10:00:00.000Z"
    }
  },
  {
    "id": "876e5432-e21b-12d3-a456-426614174888",
    "amount": "75.00",
    "type": "debit",
    "description": "Compra online",
    "status": "completed",
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "createdAt": "2024-10-15T11:00:00.000Z",
    "updatedAt": "2024-10-15T11:00:00.000Z",
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "João Silva",
      "email": "joao@example.com",
      // ... outros campos
    }
  }
]
```

### Resposta quando usuário não tem transações (200 OK)

```json
[]
```

### Erros

#### Usuário não encontrado (404 Not Found)

```json
{
  "statusCode": 404,
  "message": "User with ID 00000000-0000-0000-0000-000000000000 not found",
  "error": "Not Found"
}
```

#### UUID inválido (pode variar)

```json
{
  "statusCode": 500,
  "message": "Invalid UUID format",
  "error": "Internal Server Error"
}
```

### Lógica do Service

```typescript
async findByUserId(userId: string) {
  // 1. Verifica se o usuário existe
  const userExists = await this.prisma.user.findUnique({
    where: { id: userId },
  });

  if (!userExists) {
    throw new NotFoundException(`User with ID ${userId} not found`);
  }

  // 2. Busca as transações do usuário
  return this.prisma.transaction.findMany({
    where: { userId },
    include: {
      user: true, // Inclui dados completos do usuário
    },
    orderBy: {
      createdAt: 'desc', // Mais recentes primeiro
    },
  });
}
```

### Características

✅ **Ordenação**: Transações ordenadas por data de criação (mais recentes primeiro)
✅ **Validação**: Verifica se o usuário existe antes de buscar transações
✅ **Dados Completos**: Inclui informações do usuário em cada transação
✅ **Array Vazio**: Retorna `[]` se o usuário não tiver transações

---

## Comparação entre os endpoints

| Aspecto | GET /:transactionId | GET /user/:userId |
|---------|---------------------|-------------------|
| **Retorno** | Objeto único | Array de objetos |
| **Validação** | Verifica se transação existe | Verifica se usuário existe |
| **Ordenação** | N/A | Por data (desc) |
| **Erro 404** | Transação não encontrada | Usuário não encontrado |
| **Array vazio** | N/A | Retorna [] se sem transações |
| **Include user** | Sim | Sim |

---

## Casos de Uso

### Caso 1: Exibir detalhes de uma transação

```bash
# Usuário clica em uma transação para ver detalhes
curl http://localhost:3002/api/transactions/987e6543-e21b-12d3-a456-426614174999
```

**Uso**: Página de detalhes da transação, modais, etc.

### Caso 2: Histórico de transações do usuário

```bash
# Usuário acessa seu histórico de transações
curl http://localhost:3002/api/transactions/user/123e4567-e89b-12d3-a456-426614174000
```

**Uso**: Página de histórico, relatórios, dashboard do usuário.

### Caso 3: Verificar se transação foi criada

```bash
# Após criar transação, buscar para confirmar
POST_RESPONSE=$(curl -X POST http://localhost:3002/api/transactions -d '...')
TRANSACTION_ID=$(echo $POST_RESPONSE | jq -r '.id')
curl http://localhost:3002/api/transactions/$TRANSACTION_ID
```

**Uso**: Confirmação pós-criação, validação de integridade.

---

## Testes

### Teste 1: Buscar transação existente

```bash
# 1. Criar uma transação
TRANSACTION_ID=$(curl -X POST http://localhost:3002/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100.00,
    "type": "credit",
    "status": "completed",
    "userId": "USER_ID"
  }' | jq -r '.id')

# 2. Buscar a transação criada
curl http://localhost:3002/api/transactions/$TRANSACTION_ID
```

### Teste 2: Buscar transação inexistente

```bash
# Deve retornar 404
curl http://localhost:3002/api/transactions/00000000-0000-0000-0000-000000000000
```

### Teste 3: Listar transações de um usuário

```bash
# 1. Criar usuário
USER_ID=$(curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste User",
    "email": "teste@example.com"
  }' | jq -r '.id')

# 2. Criar algumas transações
curl -X POST http://localhost:3002/api/transactions \
  -H "Content-Type: application/json" \
  -d "{\"amount\": 100, \"type\": \"credit\", \"status\": \"completed\", \"userId\": \"$USER_ID\"}"

curl -X POST http://localhost:3002/api/transactions \
  -H "Content-Type: application/json" \
  -d "{\"amount\": 50, \"type\": \"debit\", \"status\": \"completed\", \"userId\": \"$USER_ID\"}"

# 3. Listar todas as transações do usuário
curl http://localhost:3002/api/transactions/user/$USER_ID
```

### Teste 4: Listar transações de usuário inexistente

```bash
# Deve retornar 404
curl http://localhost:3002/api/transactions/user/00000000-0000-0000-0000-000000000000
```

---

## Performance

### GET /:transactionId

- ✅ **Query única**: `findUnique` é otimizado pelo Prisma
- ✅ **Index**: Busca por ID (primary key) é instantânea
- ⚡ **Velocidade**: ~1-5ms

### GET /user/:userId

- ✅ **Query única**: `findMany` com where e include
- ✅ **Index**: userId tem índice no schema Prisma
- ✅ **Ordenação**: `orderBy` usa índice de createdAt
- ⚡ **Velocidade**: ~5-20ms (depende da quantidade de transações)

---

## Boas Práticas

1. ✅ **Sempre valide IDs**: Verificar se usuário/transação existe
2. ✅ **Inclua dados relacionados**: User sempre incluído
3. ✅ **Ordene resultados**: Mais recentes primeiro para melhor UX
4. ✅ **Trate erros adequadamente**: 404 para não encontrado
5. ✅ **Use indices**: userId e createdAt têm índices
6. ✅ **Documente comportamentos**: Array vazio vs erro 404

---

## Referências

- [Prisma findUnique](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#findunique)
- [Prisma findMany](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#findmany)
- [NestJS Exceptions](https://docs.nestjs.com/exception-filters)

