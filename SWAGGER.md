# Documentação Swagger/OpenAPI

Este documento descreve como a documentação automática das APIs foi implementada usando Swagger/OpenAPI.

## 📚 Acesso à Documentação

### Clients API
- **URL**: http://localhost:3001/api/docs
- **Aplicação**: Gerenciamento de Usuários

### Transactions API
- **URL**: http://localhost:3002/api/docs
- **Aplicação**: Gerenciamento de Transações

## 🎯 Recursos do Swagger

### Interface Interativa

A documentação Swagger oferece:

- ✅ **Visualização de Endpoints**: Todos os endpoints organizados por tags
- ✅ **Schemas de DTOs**: Estrutura completa dos objetos
- ✅ **Try it Out**: Testar endpoints diretamente no navegador
- ✅ **Exemplos**: Payloads de exemplo para cada endpoint
- ✅ **Respostas**: Códigos HTTP e mensagens de erro
- ✅ **Validações**: Regras de validação documentadas

### Funcionalidades

1. **Executar Requisições**: Teste APIs sem Postman/cURL
2. **Gerar Código Cliente**: Download de SDKs para várias linguagens
3. **Exportar Spec**: OpenAPI JSON/YAML para ferramentas externas
4. **Persistir Autorização**: Salva tokens entre requisições

## 🔧 Implementação

### Configuração (main.ts)

#### Clients App

```typescript
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('Loomi - Clients API')
  .setDescription('API para gerenciamento de clientes e usuários')
  .setVersion('1.0')
  .addTag('users', 'Endpoints relacionados a usuários')
  .addTag('clients', 'Endpoints relacionados ao serviço de clientes')
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document, {
  swaggerOptions: {
    persistAuthorization: true,
    tagsSorter: 'alpha',
    operationsSorter: 'alpha',
  },
});
```

#### Transactions App

```typescript
const config = new DocumentBuilder()
  .setTitle('Loomi - Transactions API')
  .setDescription('API para gerenciamento de transações financeiras')
  .setVersion('1.0')
  .addTag('transactions', 'Endpoints relacionados a transações financeiras')
  .build();
```

### Decorators Usados

#### DTOs

##### @ApiProperty (campos obrigatórios)

```typescript
@ApiProperty({
  description: 'Nome completo do usuário',
  example: 'João Silva',
})
@IsString()
@IsNotEmpty()
name: string;
```

##### @ApiPropertyOptional (campos opcionais)

```typescript
@ApiPropertyOptional({
  description: 'Telefone do usuário',
  example: '(11) 98765-4321',
  required: false,
})
@IsString()
@IsOptional()
phone?: string;
```

##### Enums

```typescript
@ApiProperty({
  description: 'Tipo de transação',
  enum: ['credit', 'debit', 'transfer'],
  example: 'credit',
})
@IsIn(['credit', 'debit', 'transfer'])
type: string;
```

#### Controllers

##### @ApiTags

```typescript
@ApiTags('users')
@Controller('api/users')
export class UsersController {}
```

##### @ApiOperation

```typescript
@ApiOperation({ 
  summary: 'Criar novo usuário',
  description: 'Descrição detalhada...'
})
@Post()
create() {}
```

##### @ApiResponse

```typescript
@ApiResponse({
  status: HttpStatus.CREATED,
  description: 'Usuário criado com sucesso',
})
@ApiResponse({
  status: HttpStatus.BAD_REQUEST,
  description: 'Dados inválidos',
})
```

##### @ApiParam

```typescript
@ApiParam({
  name: 'id',
  description: 'UUID do usuário',
  example: '123e4567-e89b-12d3-a456-426614174000',
})
@Get(':id')
findOne(@Param('id') id: string) {}
```

##### @ApiBody

```typescript
@ApiBody({ type: CreateUserDto })
@Post()
create(@Body() dto: CreateUserDto) {}
```

## 📋 Documentação por Endpoint

### Clients API

#### POST /api/users
- **Summary**: Criar novo usuário
- **Body**: CreateUserDto (8 campos: name, email, cpf, etc.)
- **Responses**: 201 Created, 400 Bad Request

#### GET /api/users
- **Summary**: Listar todos os usuários
- **Responses**: 200 OK
- **Note**: Cache habilitado

#### GET /api/users/:id
- **Summary**: Buscar usuário por ID
- **Param**: id (UUID)
- **Responses**: 200 OK, 404 Not Found
- **Note**: Cache habilitado

#### PATCH /api/users/:id
- **Summary**: Atualizar usuário
- **Param**: id (UUID)
- **Body**: UpdateUserDto (todos campos opcionais)
- **Responses**: 200 OK, 404 Not Found, 400 Bad Request
- **Note**: Emite evento RabbitMQ se dados bancários mudarem

#### DELETE /api/users/:id
- **Summary**: Deletar usuário
- **Param**: id (UUID)
- **Responses**: 200 OK, 404 Not Found

### Transactions API

#### POST /api/transactions
- **Summary**: Criar nova transação
- **Body**: CreateTransactionDto (amount, type, status, userId)
- **Responses**: 201 Created, 400 Bad Request

#### GET /api/transactions
- **Summary**: Listar todas as transações
- **Responses**: 200 OK

#### GET /api/transactions/:id
- **Summary**: Buscar transação por ID
- **Param**: id (UUID)
- **Responses**: 200 OK, 404 Not Found

#### GET /api/transactions/user/:userId
- **Summary**: Listar transações de um usuário
- **Param**: userId (UUID)
- **Responses**: 200 OK, 404 Not Found

#### PATCH /api/transactions/:id
- **Summary**: Atualizar transação
- **Param**: id (UUID)
- **Body**: UpdateTransactionDto
- **Responses**: 200 OK, 404 Not Found, 400 Bad Request

#### DELETE /api/transactions/:id
- **Summary**: Deletar transação
- **Param**: id (UUID)
- **Responses**: 200 OK, 404 Not Found

## 🚀 Como Usar

### 1. Acessar a Documentação

```bash
# Iniciar aplicações
npm run start:clients:dev
npm run start:transactions:dev

# Acessar no navegador
open http://localhost:3001/api/docs  # Clients
open http://localhost:3002/api/docs  # Transactions
```

### 2. Testar Endpoints

1. Abra a URL do Swagger no navegador
2. Expanda um endpoint (ex: POST /api/users)
3. Clique em "Try it out"
4. Preencha os campos (já vem com exemplos)
5. Clique em "Execute"
6. Veja a resposta abaixo

### 3. Visualizar Schemas

1. No Swagger UI, role até o final da página
2. Seção "Schemas" mostra todos os DTOs
3. Clique em um schema para expandir
4. Veja todos os campos com:
   - Tipo de dado
   - Obrigatório/Opcional
   - Validações
   - Exemplos

### 4. Exportar Especificação

```bash
# OpenAPI JSON
curl http://localhost:3001/api/docs-json > clients-api.json
curl http://localhost:3002/api/docs-json > transactions-api.json

# OpenAPI YAML
curl http://localhost:3001/api/docs-yaml > clients-api.yaml
curl http://localhost:3002/api/docs-yaml > transactions-api.yaml
```

## 💡 Exemplos de Uso

### Exemplo 1: Criar Usuário via Swagger

1. Acesse http://localhost:3001/api/docs
2. Expanda `POST /api/users`
3. Clique "Try it out"
4. O payload de exemplo já está preenchido:
   ```json
   {
     "name": "João Silva",
     "email": "joao.silva@example.com",
     "cpf": "123.456.789-00",
     "phone": "(11) 98765-4321"
   }
   ```
5. Clique "Execute"
6. Veja a resposta com status 201

### Exemplo 2: Buscar Transações

1. Acesse http://localhost:3002/api/docs
2. Expanda `GET /api/transactions`
3. Clique "Try it out"
4. Clique "Execute"
5. Veja a lista de transações

### Exemplo 3: Testar Validações

1. Acesse http://localhost:3002/api/docs
2. Expanda `POST /api/transactions`
3. Clique "Try it out"
4. Altere `amount` para `-50` (valor negativo)
5. Execute
6. Veja erro 400 com mensagem de validação

## 🎨 Personalizações

### Adicionar Autenticação

```typescript
const config = new DocumentBuilder()
  .setTitle('Loomi - API')
  .addBearerAuth()
  .build();
```

No controller:
```typescript
@ApiBearerAuth()
@Controller('api/users')
export class UsersController {}
```

### Adicionar Servidor

```typescript
const config = new DocumentBuilder()
  .addServer('http://localhost:3001', 'Desenvolvimento')
  .addServer('https://api.loomi.com', 'Produção')
  .build();
```

### Adicionar Contato

```typescript
const config = new DocumentBuilder()
  .setContact('Equipe Loomi', 'https://loomi.com', 'contato@loomi.com')
  .setLicense('MIT', 'https://opensource.org/licenses/MIT')
  .build();
```

### Customizar UI

```typescript
SwaggerModule.setup('api/docs', app, document, {
  customSiteTitle: 'Loomi API Docs',
  customCss: '.swagger-ui .topbar { display: none }',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    tagsSorter: 'alpha',
    operationsSorter: 'alpha',
  },
});
```

## 📊 Schemas Documentados

### Clients API

#### CreateUserDto
- name: string (obrigatório)
- email: string (obrigatório, formato email)
- cpf: string (opcional)
- phone: string (opcional)
- address: string (opcional)
- city: string (opcional)
- state: string (opcional)
- zipCode: string (opcional)

#### UpdateUserDto
- Todos os campos opcionais
- Mesma estrutura do CreateUserDto

### Transactions API

#### CreateTransactionDto
- amount: number (obrigatório, positivo, máx 2 decimais)
- type: enum ['credit', 'debit', 'transfer'] (obrigatório)
- description: string (opcional)
- status: enum ['pending', 'completed', 'failed', 'cancelled'] (obrigatório)
- userId: string UUID (obrigatório)

#### UpdateTransactionDto
- Todos os campos opcionais
- Mesma validação do CreateTransactionDto

## 🔍 Vantagens do Swagger

### Para Desenvolvedores

1. ✅ **Documentação Automática**: Atualizada automaticamente
2. ✅ **Testes Rápidos**: Sem precisar de Postman/Insomnia
3. ✅ **Validação Visual**: Ver regras diretamente
4. ✅ **Exemplos Prontos**: Não precisa criar payloads
5. ✅ **Menos Erros**: Interface visual ajuda a evitar erros

### Para Equipe

1. ✅ **Onboarding Rápido**: Novos membros entendem a API
2. ✅ **Contrato da API**: Spec compartilhada com frontend
3. ✅ **Geração de SDKs**: Clientes automáticos
4. ✅ **Testes Manuais**: QA pode testar sem ferramentas externas
5. ✅ **Documentação Sempre Atualizada**: Sincronizada com código

### Para Integrações

1. ✅ **OpenAPI Spec**: Padrão da indústria
2. ✅ **Importar em Ferramentas**: Postman, Insomnia, etc.
3. ✅ **Code Generation**: Gerar clientes TypeScript, Java, Python, etc.
4. ✅ **Mock Servers**: Criar mocks baseados na spec

## 🛠️ Gerando Clientes

### TypeScript/JavaScript

```bash
# Exportar spec
curl http://localhost:3001/api/docs-json > clients-api.json

# Usar openapi-generator
npx @openapitools/openapi-generator-cli generate \
  -i clients-api.json \
  -g typescript-axios \
  -o ./generated/clients-sdk
```

### Python

```bash
npx @openapitools/openapi-generator-cli generate \
  -i clients-api.json \
  -g python \
  -o ./generated/clients-python
```

### Java

```bash
npx @openapitools/openapi-generator-cli generate \
  -i clients-api.json \
  -g java \
  -o ./generated/clients-java
```

## 📝 Melhores Práticas

### 1. Sempre Documentar

```typescript
// ❌ Sem documentação
@Get(':id')
findOne(@Param('id') id: string) {}

// ✅ Com documentação
@Get(':id')
@ApiOperation({ summary: 'Buscar usuário por ID' })
@ApiParam({ name: 'id', description: 'UUID do usuário' })
@ApiResponse({ status: 200, description: 'Usuário encontrado' })
findOne(@Param('id') id: string) {}
```

### 2. Usar Exemplos Realistas

```typescript
@ApiProperty({
  example: 'João Silva', // ✅ Exemplo realista
  // example: 'string',  // ❌ Exemplo genérico
})
name: string;
```

### 3. Documentar Erros

```typescript
@ApiResponse({ status: 200, description: 'Sucesso' })
@ApiResponse({ status: 400, description: 'Dados inválidos' })
@ApiResponse({ status: 404, description: 'Não encontrado' })
@ApiResponse({ status: 500, description: 'Erro do servidor' })
```

### 4. Usar Enums

```typescript
@ApiProperty({
  enum: ['credit', 'debit', 'transfer'],
  example: 'credit',
})
type: string;
```

### 5. Agrupar com Tags

```typescript
@ApiTags('users')       // Agrupa endpoints relacionados
@Controller('api/users')
export class UsersController {}
```

## 🔗 Integrações

### Importar no Postman

1. Abra Postman
2. File > Import
3. Cole a URL: `http://localhost:3001/api/docs-json`
4. Clique Import
5. Todos os endpoints são importados com exemplos

### Importar no Insomnia

1. Abra Insomnia
2. Create > Import from URL
3. Cole: `http://localhost:3001/api/docs-json`
4. Import

### Usar com Swagger Editor

1. Acesse: https://editor.swagger.io
2. File > Import URL
3. Cole: `http://localhost:3001/api/docs-json`
4. Editar e validar spec

## 📊 Comparação

| Ferramenta | Swagger UI | Postman | cURL |
|------------|-----------|---------|------|
| **Setup** | Nenhum | Download | Linha de comando |
| **Interface** | Web | Desktop/Web | Terminal |
| **Documentação** | ✅ Automática | Manual | Nenhuma |
| **Exemplos** | ✅ Inclusos | Manual | Manual |
| **Compartilhar** | ✅ URL | Workspace | Scripts |
| **Validação** | ✅ Visual | Sim | Manual |

## 🎓 Recursos Adicionados

### Clients API (/api/docs)

- 5 endpoints documentados
- 2 DTOs (CreateUserDto, UpdateUserDto)
- Tags: users, clients
- Exemplos brasileiros realistas
- Validações detalhadas
- Códigos de resposta HTTP

### Transactions API (/api/docs)

- 6 endpoints documentados
- 2 DTOs (CreateTransactionDto, UpdateTransactionDto)
- Tags: transactions
- Enums para type e status
- Validações de valores monetários
- Exemplos de transações

## 🔒 Segurança

### Produção

Em produção, você pode:

1. **Desabilitar Swagger:**
   ```typescript
   if (process.env.NODE_ENV !== 'production') {
     SwaggerModule.setup('api/docs', app, document);
   }
   ```

2. **Proteger com Senha:**
   ```typescript
   app.use('/api/docs', basicAuth({
     users: { 'admin': 'senha123' },
     challenge: true,
   }));
   ```

3. **Usar API Key:**
   ```typescript
   .addApiKey({ type: 'apiKey', name: 'X-API-KEY', in: 'header' })
   ```

## 📚 Referências

- [NestJS Swagger](https://docs.nestjs.com/openapi/introduction)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)
- [OpenAPI Generator](https://openapi-generator.tech/)

## 💡 Dicas

1. ✅ Use `@ApiProperty` para todos os campos de DTOs
2. ✅ Adicione exemplos realistas
3. ✅ Document all status codes
4. ✅ Use enums quando aplicável
5. ✅ Agrupe endpoints com tags
6. ✅ Mantenha descrições curtas e claras
7. ✅ Teste a documentação regularmente
8. ✅ Exporte spec para versionamento

