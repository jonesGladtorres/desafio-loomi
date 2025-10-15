# API de Transações - Documentação

Este documento descreve detalhadamente o endpoint POST /api/transactions.

## Endpoint POST /api/transactions

Cria uma nova transação no sistema.

### URL
```
POST http://localhost:3002/api/transactions
```

### Headers
```
Content-Type: application/json
```

### Body (CreateTransactionDto)

```typescript
{
  amount: number;      // Valor da transação (positivo, máx 2 decimais)
  type: string;        // Tipo: 'credit', 'debit' ou 'transfer'
  description?: string; // Descrição (opcional)
  status: string;      // Status: 'pending', 'completed', 'failed' ou 'cancelled'
  userId: string;      // UUID do usuário (deve existir no banco)
}
```

### Validações

#### amount (obrigatório)
- ✅ Deve ser um número
- ✅ Deve ser positivo (maior que 0)
- ✅ Máximo de 2 casas decimais
- ❌ Não pode ser negativo
- ❌ Não pode ser zero

#### type (obrigatório)
- ✅ Deve ser uma string
- ✅ Valores aceitos: `'credit'`, `'debit'`, `'transfer'`
- ❌ Qualquer outro valor retorna erro

#### description (opcional)
- ✅ Pode ser omitido
- ✅ Se fornecido, deve ser uma string

#### status (obrigatório)
- ✅ Deve ser uma string
- ✅ Valores aceitos: `'pending'`, `'completed'`, `'failed'`, `'cancelled'`
- ❌ Qualquer outro valor retorna erro

#### userId (obrigatório)
- ✅ Deve ser uma string
- ✅ Deve ser um UUID válido (v4)
- ✅ Usuário deve existir no banco de dados
- ❌ UUID inválido retorna erro de validação
- ❌ Usuário inexistente retorna erro 400

### Exemplos de Requisição

#### Exemplo 1: Transação de Crédito

```bash
curl -X POST http://localhost:3002/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1500.00,
    "type": "credit",
    "description": "Salário mensal",
    "status": "completed",
    "userId": "123e4567-e89b-12d3-a456-426614174000"
  }'
```

**Resposta (201 Created):**
```json
{
  "id": "987e6543-e21b-12d3-a456-426614174999",
  "amount": "1500.00",
  "type": "credit",
  "description": "Salário mensal",
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

#### Exemplo 2: Transação de Débito

```bash
curl -X POST http://localhost:3002/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 75.50,
    "type": "debit",
    "description": "Compra no supermercado",
    "status": "completed",
    "userId": "123e4567-e89b-12d3-a456-426614174000"
  }'
```

#### Exemplo 3: Transferência Pendente

```bash
curl -X POST http://localhost:3002/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 300.00,
    "type": "transfer",
    "description": "Transferência para poupança",
    "status": "pending",
    "userId": "123e4567-e89b-12d3-a456-426614174000"
  }'
```

#### Exemplo 4: Sem Descrição (opcional)

```bash
curl -X POST http://localhost:3002/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100.00,
    "type": "credit",
    "status": "completed",
    "userId": "123e4567-e89b-12d3-a456-426614174000"
  }'
```

### Exemplos de Erros

#### Erro 1: Valor Negativo (400 Bad Request)

**Requisição:**
```json
{
  "amount": -50.00,
  "type": "credit",
  "status": "completed",
  "userId": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Resposta:**
```json
{
  "statusCode": 400,
  "message": [
    "amount must be a positive number"
  ],
  "error": "Bad Request"
}
```

#### Erro 2: Tipo Inválido (400 Bad Request)

**Requisição:**
```json
{
  "amount": 100.00,
  "type": "invalid_type",
  "status": "completed",
  "userId": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Resposta:**
```json
{
  "statusCode": 400,
  "message": [
    "type must be one of: credit, debit, transfer"
  ],
  "error": "Bad Request"
}
```

#### Erro 3: Status Inválido (400 Bad Request)

**Requisição:**
```json
{
  "amount": 100.00,
  "type": "credit",
  "status": "invalid_status",
  "userId": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Resposta:**
```json
{
  "statusCode": 400,
  "message": [
    "status must be one of: pending, completed, failed, cancelled"
  ],
  "error": "Bad Request"
}
```

#### Erro 4: UUID Inválido (400 Bad Request)

**Requisição:**
```json
{
  "amount": 100.00,
  "type": "credit",
  "status": "completed",
  "userId": "not-a-valid-uuid"
}
```

**Resposta:**
```json
{
  "statusCode": 400,
  "message": [
    "userId must be a valid UUID"
  ],
  "error": "Bad Request"
}
```

#### Erro 5: Usuário Não Existe (400 Bad Request)

**Requisição:**
```json
{
  "amount": 100.00,
  "type": "credit",
  "status": "completed",
  "userId": "00000000-0000-0000-0000-000000000000"
}
```

**Resposta:**
```json
{
  "statusCode": 400,
  "message": "User with ID 00000000-0000-0000-0000-000000000000 not found",
  "error": "Bad Request"
}
```

#### Erro 6: Campo Obrigatório Faltando (400 Bad Request)

**Requisição:**
```json
{
  "type": "credit",
  "status": "completed",
  "userId": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Resposta:**
```json
{
  "statusCode": 400,
  "message": [
    "amount should not be empty",
    "amount must be a positive number",
    "amount must be a number conforming to the specified constraints"
  ],
  "error": "Bad Request"
}
```

## Lógica do TransactionsService

### Método create()

```typescript
async create(createTransactionDto: CreateTransactionDto) {
  // 1. Verifica se o usuário existe
  const userExists = await this.prisma.user.findUnique({
    where: { id: createTransactionDto.userId },
  });

  if (!userExists) {
    throw new BadRequestException(
      `User with ID ${createTransactionDto.userId} not found`,
    );
  }

  // 2. Cria a transação
  return this.prisma.transaction.create({
    data: createTransactionDto,
    include: {
      user: true, // Inclui dados do usuário na resposta
    },
  });
}
```

### Fluxo de Validação

1. **ValidationPipe (NestJS)**
   - Valida estrutura do DTO
   - Verifica tipos de dados
   - Valida decorators do class-validator

2. **TransactionsService**
   - Verifica se o usuário existe no banco
   - Cria a transação usando Prisma

3. **Prisma**
   - Valida constraints do banco
   - Executa a inserção
   - Retorna a transação criada com dados do usuário

## Testes

### Teste 1: Criação Bem-Sucedida

```bash
# Primeiro, crie um usuário
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste User",
    "email": "teste@example.com"
  }'

# Copie o ID do usuário da resposta

# Crie uma transação
curl -X POST http://localhost:3002/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100.00,
    "type": "credit",
    "status": "completed",
    "userId": "ID-COPIADO-AQUI"
  }'
```

### Teste 2: Verificar Validações

Use o arquivo `apps/transactions/src/transactions/transactions.http` que contém exemplos de todas as validações.

## Boas Práticas

1. ✅ **Sempre valide o userId** - Garante integridade referencial
2. ✅ **Use valores positivos** - Transações negativas não fazem sentido
3. ✅ **Tipos padronizados** - Facilita relatórios e análises
4. ✅ **Status claros** - Permite rastreamento do ciclo de vida
5. ✅ **Descrições opcionais** - Flexibilidade sem perder informações importantes

## Integração com Usuários

Cada transação está vinculada a um usuário através do campo `userId`. O sistema:

- ✅ Verifica se o usuário existe antes de criar a transação
- ✅ Retorna os dados completos do usuário na resposta
- ✅ Usa CASCADE delete (se o usuário for deletado, suas transações também são)

## Referências

- [NestJS Validation](https://docs.nestjs.com/techniques/validation)
- [class-validator Decorators](https://github.com/typestack/class-validator)
- [Prisma Client](https://www.prisma.io/docs/concepts/components/prisma-client)

