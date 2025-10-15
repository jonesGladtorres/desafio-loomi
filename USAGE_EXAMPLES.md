# Exemplos de Uso da API

## Endpoint PATCH /api/users/{userId}

Este documento mostra exemplos práticos de como usar o endpoint de atualização de usuários.

### Características do Endpoint

- **URL**: `PATCH /api/users/{userId}`
- **Validação**: Todos os campos são validados usando `class-validator`
- **Atualização Parcial**: Você pode atualizar apenas os campos que desejar
- **Resposta**: Retorna o usuário atualizado com suas transações relacionadas

### Exemplos de Requisições

#### 1. Atualizar Nome e Telefone

```bash
curl -X PATCH http://localhost:3001/api/users/123e4567-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva Atualizado",
    "phone": "(11) 91234-5678"
  }'
```

#### 2. Atualizar Apenas o Email

```bash
curl -X PATCH http://localhost:3001/api/users/123e4567-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao.novo@example.com"
  }'
```

#### 3. Atualizar Endereço Completo

```bash
curl -X PATCH http://localhost:3001/api/users/123e4567-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json" \
  -d '{
    "address": "Avenida Paulista, 1000",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01310-100"
  }'
```

#### 4. Atualizar Todos os Campos

```bash
curl -X PATCH http://localhost:3001/api/users/123e4567-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Santos",
    "email": "maria.santos@example.com",
    "cpf": "987.654.321-00",
    "phone": "(21) 98765-4321",
    "address": "Rua das Palmeiras, 456",
    "city": "Rio de Janeiro",
    "state": "RJ",
    "zipCode": "22041-030"
  }'
```

### Respostas

#### Sucesso (200 OK)

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "João Silva Atualizado",
  "email": "joao.silva@example.com",
  "cpf": "123.456.789-00",
  "phone": "(11) 91234-5678",
  "address": "Rua das Flores, 123",
  "city": "São Paulo",
  "state": "SP",
  "zipCode": "01234-567",
  "createdAt": "2024-10-15T03:30:00.000Z",
  "updatedAt": "2024-10-15T03:45:00.000Z",
  "transactions": []
}
```

#### Erro - Usuário não encontrado (404 Not Found)

```json
{
  "statusCode": 404,
  "message": "User with ID 123e4567-e89b-12d3-a456-426614174000 not found",
  "error": "Not Found"
}
```

#### Erro - Validação (400 Bad Request)

```json
{
  "statusCode": 400,
  "message": [
    "email must be an email"
  ],
  "error": "Bad Request"
}
```

### Validações Aplicadas

Cada campo possui validações específicas:

| Campo | Validação | Obrigatório |
|-------|-----------|-------------|
| name | Deve ser uma string | Não |
| email | Deve ser um email válido | Não |
| cpf | Deve ser uma string | Não |
| phone | Deve ser uma string | Não |
| address | Deve ser uma string | Não |
| city | Deve ser uma string | Não |
| state | Deve ser uma string | Não |
| zipCode | Deve ser uma string | Não |

**Nota**: Todos os campos são opcionais no UpdateUserDto, permitindo atualização parcial.

### Testes com REST Client (VSCode)

Se você usa o VSCode com a extensão REST Client, pode usar o arquivo `apps/clients/src/users/users.http` que contém exemplos prontos para teste.

### Testes com Postman/Insomnia

1. Importe a URL base: `http://localhost:3001`
2. Crie uma requisição PATCH para `/api/users/{userId}`
3. Adicione o header: `Content-Type: application/json`
4. No body, adicione um JSON com os campos que deseja atualizar
5. Execute a requisição

### Comportamento

- ✅ **Atualização Parcial**: Apenas os campos enviados serão atualizados
- ✅ **Validação**: Campos inválidos retornarão erro 400
- ✅ **Verificação**: O endpoint verifica se o usuário existe antes de atualizar
- ✅ **Transações**: Retorna o usuário com suas transações relacionadas
- ✅ **Timestamps**: O campo `updatedAt` é atualizado automaticamente pelo Prisma

