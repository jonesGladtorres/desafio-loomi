# Integração RabbitMQ - Comunicação Assíncrona

Este documento detalha como a comunicação assíncrona foi implementada entre os apps **clients** e **transactions** usando RabbitMQ.

## 📋 Visão Geral

### Arquitetura de Eventos

```
┌─────────────────┐                    ┌─────────────────┐
│   Clients App   │                    │ Transactions App│
│   (Producer)    │                    │   (Consumer)    │
│                 │                    │                 │
│  UsersService   │   RabbitMQ Queue   │TransactionsCtrl │
│                 │   ┌──────────┐     │                 │
│  update() ──────┼──▶│user_     │────▶│ @EventPattern   │
│                 │   │events    │     │ handleUser...() │
│                 │   │_queue    │     │                 │
│                 │   └──────────┘     │                 │
└─────────────────┘                    └─────────────────┘
```

## 🎯 Evento Implementado

### `user_banking_updated`

Evento emitido quando dados bancários de um usuário são atualizados.

**Campos monitorados:**
- name
- email
- cpf
- phone
- address
- city
- state
- zipCode

## 🔧 Implementação

### 1. App Clients (Producer)

#### UsersModule

```typescript
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'RABBITMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://loomi_user:loomi_password@localhost:5672'],
          queue: 'user_events_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  // ...
})
export class UsersModule {}
```

#### UsersService

```typescript
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('RABBITMQ_SERVICE') private readonly rabbitClient: ClientProxy,
  ) {}

  async update(id: string, updateUserDto: UpdateUserDto) {
    // Atualiza o usuário
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      include: { transactions: true },
    });

    // Verifica se campos bancários foram atualizados
    const bankingFieldsUpdated = this.checkBankingFieldsUpdated(updateUserDto);

    if (bankingFieldsUpdated) {
      // Emite evento para o RabbitMQ
      this.rabbitClient.emit('user_banking_updated', {
        userId: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        cpf: updatedUser.cpf,
        updatedFields: Object.keys(updateUserDto),
        timestamp: new Date().toISOString(),
      });

      console.log(`📤 Evento emitido para usuário ${updatedUser.id}`);
    }

    return updatedUser;
  }

  private checkBankingFieldsUpdated(updateUserDto: UpdateUserDto): boolean {
    const bankingFields = ['name', 'email', 'cpf', 'phone', 'address', 'city', 'state', 'zipCode'];
    return bankingFields.some(field => updateUserDto[field] !== undefined);
  }
}
```

### 2. App Transactions (Consumer)

#### main.ts (Modo Híbrido)

```typescript
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(TransactionsModule);

  // Conecta o microservice RabbitMQ (modo híbrido)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://loomi_user:loomi_password@localhost:5672'],
      queue: 'user_events_queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  // Inicia microservices E servidor HTTP
  await app.startAllMicroservices();
  await app.listen(3002);
}
```

#### TransactionsController

```typescript
import { EventPattern, Payload } from '@nestjs/microservices';

interface UserBankingUpdatedEvent {
  userId: string;
  name: string;
  email: string;
  cpf?: string;
  updatedFields: string[];
  timestamp: string;
}

@Controller('api/transactions')
export class TransactionsController {
  // ... HTTP endpoints ...

  @EventPattern('user_banking_updated')
  async handleUserBankingUpdated(@Payload() data: UserBankingUpdatedEvent) {
    console.log('📥 Evento recebido: user_banking_updated');
    console.log('📋 Dados:', data);

    // Buscar transações do usuário
    const userTransactions = await this.transactionsService.findByUserId(data.userId);
    console.log(`✅ Usuário possui ${userTransactions.length} transação(ões)`);

    // Implementar lógica de negócio aqui
  }
}
```

## 🧪 Como Testar

### Passo 1: Iniciar Serviços

```bash
# Opção 1: Apenas infraestrutura (desenvolvimento)
npm run docker:dev:up

# Opção 2: Todos os serviços (produção)
npm run docker:up
```

### Passo 2: Iniciar Aplicações (se modo dev)

```bash
# Terminal 1
npm run start:clients:dev

# Terminal 2
npm run start:transactions:dev
```

### Passo 3: Criar Usuário

```bash
USER_ID=$(curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "cpf": "123.456.789-00"
  }' | jq -r '.id')

echo "User ID: $USER_ID"
```

### Passo 4: Atualizar Usuário (dispara evento)

```bash
# Atualizar dados bancários
curl -X PATCH http://localhost:3001/api/users/$USER_ID \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva Atualizado",
    "phone": "(11) 98765-4321"
  }'
```

### Passo 5: Verificar Logs

**Terminal do Clients App:**
```
📤 Evento 'user_banking_updated' emitido para o usuário 123e4567-...
```

**Terminal do Transactions App:**
```
📥 Evento recebido: user_banking_updated
📋 Dados do evento: {
  userId: '123e4567-e89b-12d3-a456-426614174000',
  name: 'João Silva Atualizado',
  email: 'joao@example.com',
  cpf: '123.456.789-00',
  updatedFields: [ 'name', 'phone' ],
  timestamp: '2024-10-15T15:30:00.000Z'
}
✅ Usuário João Silva Atualizado possui 0 transação(ões)
```

### Passo 6: Monitorar no RabbitMQ UI

Acesse: http://localhost:15672

**Login:** loomi_user / loomi_password

**O que verificar:**
- Queue: `user_events_queue`
- Exchanges
- Mensagens processadas
- Taxa de processamento

## 📊 Payload do Evento

### user_banking_updated

```typescript
{
  userId: string;          // UUID do usuário
  name: string;            // Nome atualizado
  email: string;           // Email atualizado
  cpf?: string;            // CPF (opcional)
  updatedFields: string[]; // Lista de campos que foram atualizados
  timestamp: string;       // ISO timestamp do evento
}
```

**Exemplo:**
```json
{
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "name": "João Silva Atualizado",
  "email": "joao.silva@example.com",
  "cpf": "123.456.789-00",
  "updatedFields": ["name", "phone", "address"],
  "timestamp": "2024-10-15T15:30:00.000Z"
}
```

## 🎯 Casos de Uso

### 1. Auditoria

Registrar histórico de alterações de usuários:

```typescript
@EventPattern('user_banking_updated')
async handleUserBankingUpdated(@Payload() data: UserBankingUpdatedEvent) {
  // Criar registro de auditoria
  await this.auditService.create({
    event: 'user_banking_updated',
    userId: data.userId,
    changes: data.updatedFields,
    timestamp: data.timestamp,
  });
}
```

### 2. Notificações

Enviar notificação quando dados bancários mudarem:

```typescript
@EventPattern('user_banking_updated')
async handleUserBankingUpdated(@Payload() data: UserBankingUpdatedEvent) {
  // Enviar email de confirmação
  await this.notificationService.sendEmail({
    to: data.email,
    subject: 'Dados bancários atualizados',
    template: 'banking-update',
    context: {
      name: data.name,
      updatedFields: data.updatedFields,
    },
  });
}
```

### 3. Sincronização de Cache

Invalidar cache em outros serviços:

```typescript
@EventPattern('user_banking_updated')
async handleUserBankingUpdated(@Payload() data: UserBankingUpdatedEvent) {
  // Invalidar cache de transações do usuário
  await this.cacheManager.del(`transactions:user:${data.userId}`);
}
```

### 4. Webhooks

Disparar webhooks para sistemas externos:

```typescript
@EventPattern('user_banking_updated')
async handleUserBankingUpdated(@Payload() data: UserBankingUpdatedEvent) {
  // Notificar sistemas externos
  await this.webhookService.trigger('user-updated', data);
}
```

## 🔍 Debugging

### Ver Mensagens no RabbitMQ

```bash
# 1. Acessar RabbitMQ Management UI
open http://localhost:15672

# 2. Ir para Queues
# 3. Clicar em 'user_events_queue'
# 4. Ver mensagens em 'Get messages'
```

### Logs

**Clients App:**
```
📤 Evento 'user_banking_updated' emitido para o usuário <userId>
```

**Transactions App:**
```
📥 Evento recebido: user_banking_updated
📋 Dados do evento: { ... }
✅ Usuário <name> possui <count> transação(ões)
```

### RabbitMQ CLI

```bash
# Listar filas
docker exec -it loomi-rabbitmq rabbitmqctl list_queues

# Ver bindings
docker exec -it loomi-rabbitmq rabbitmqctl list_bindings

# Ver conexões
docker exec -it loomi-rabbitmq rabbitmqctl list_connections
```

## ⚙️ Configuração

### Variáveis de Ambiente

```env
# .env
RABBITMQ_URL=amqp://loomi_user:loomi_password@localhost:5672
```

**Em produção (Docker):**
```env
RABBITMQ_URL=amqp://loomi_user:loomi_password@rabbitmq:5672
```

### Queue Options

```typescript
queueOptions: {
  durable: true,  // Persistir mensagens em disco
}
```

**Vantagens:**
- ✅ Mensagens sobrevivem a restart do RabbitMQ
- ✅ Garante entrega mesmo em caso de falha
- ✅ Suporta alta disponibilidade

## 🚀 Benefícios

### 1. Desacoplamento

- ✅ Apps não precisam se conhecer diretamente
- ✅ Fácil adicionar novos consumidores
- ✅ Fácil escalar horizontalmente

### 2. Resiliência

- ✅ Mensagens persistidas
- ✅ Retry automático
- ✅ Dead letter queues (DLQ) configuráveis

### 3. Performance

- ✅ Assíncrono - não bloqueia requisição HTTP
- ✅ Processamento em background
- ✅ Load balancing automático

### 4. Flexibilidade

- ✅ Fácil adicionar novos eventos
- ✅ Múltiplos consumidores por evento
- ✅ Padrões pub/sub e work queues

## 📈 Expandindo a Integração

### Adicionar Novo Evento

#### 1. No Producer (Clients)

```typescript
// UsersService
this.rabbitClient.emit('user_created', {
  userId: newUser.id,
  name: newUser.name,
  email: newUser.email,
  timestamp: new Date().toISOString(),
});
```

#### 2. No Consumer (Transactions)

```typescript
// TransactionsController
@EventPattern('user_created')
async handleUserCreated(@Payload() data: any) {
  console.log('📥 Novo usuário criado:', data);
  // Implementar lógica
}
```

### Padrões Avançados

#### Request-Response

```typescript
// Producer
const result = await this.rabbitClient.send('get_user_balance', { userId });

// Consumer
@MessagePattern('get_user_balance')
async getUserBalance(@Payload() data: any) {
  return { balance: 1000 };
}
```

#### Multiple Consumers

Múltiplos serviços podem escutar o mesmo evento:

```
user_banking_updated
  ├─▶ Transactions App (auditoria)
  ├─▶ Notifications App (email)
  └─▶ Analytics App (métricas)
```

## 🧪 Testes de Integração

### Teste 1: Evento Básico

```bash
# 1. Iniciar serviços
npm run docker:dev:up
npm run start:clients:dev        # Terminal 1
npm run start:transactions:dev   # Terminal 2

# 2. Criar usuário
USER_ID=$(curl -s -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com"}' | jq -r '.id')

# 3. Atualizar e verificar logs
curl -X PATCH http://localhost:3001/api/users/$USER_ID \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Updated"}'

# Ver logs do Transactions App - deve mostrar evento recebido
```

### Teste 2: Campo Não-Bancário (não dispara evento)

```bash
# Atualizar apenas transações (não é campo bancário)
# Não deve disparar evento
curl -X PATCH http://localhost:3001/api/users/$USER_ID \
  -H "Content-Type: application/json" \
  -d '{"someOtherField":"value"}'

# Logs não devem mostrar evento
```

### Teste 3: Múltiplos Campos

```bash
# Atualizar vários campos bancários
curl -X PATCH http://localhost:3001/api/users/$USER_ID \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Name",
    "email": "new@example.com",
    "phone": "123456789",
    "address": "New Address"
  }'

# Ver nos logs: updatedFields deve ter 4 campos
```

## 🔒 Boas Práticas

### 1. Validação de Eventos

```typescript
// Definir interface para tipo seguro
interface UserBankingUpdatedEvent {
  userId: string;
  name: string;
  email: string;
  cpf?: string;
  updatedFields: string[];
  timestamp: string;
}

// Usar @Payload() com tipo
@EventPattern('user_banking_updated')
async handleUserBankingUpdated(@Payload() data: UserBankingUpdatedEvent) {
  // TypeScript garante estrutura correta
}
```

### 2. Error Handling

```typescript
@EventPattern('user_banking_updated')
async handleUserBankingUpdated(@Payload() data: UserBankingUpdatedEvent) {
  try {
    await this.processEvent(data);
  } catch (error) {
    console.error('❌ Erro ao processar evento:', error);
    // Implementar retry ou DLQ
  }
}
```

### 3. Idempotência

```typescript
@EventPattern('user_banking_updated')
async handleUserBankingUpdated(@Payload() data: UserBankingUpdatedEvent) {
  // Verificar se já processou este evento
  const alreadyProcessed = await this.checkIfProcessed(data.userId, data.timestamp);
  
  if (alreadyProcessed) {
    console.log('⏭️  Evento já processado, pulando...');
    return;
  }

  // Processar evento
  await this.processEvent(data);
}
```

### 4. Logging Estruturado

```typescript
console.log(JSON.stringify({
  event: 'user_banking_updated',
  userId: data.userId,
  fields: data.updatedFields,
  timestamp: data.timestamp,
}));
```

## 📊 Monitoramento

### Métricas Importantes

1. **Taxa de Mensagens**
   - Mensagens por segundo
   - Mensagens em fila
   - Mensagens processadas

2. **Latência**
   - Tempo de processamento
   - Tempo em fila
   - Tempo total (end-to-end)

3. **Erros**
   - Mensagens com erro
   - Retries
   - Dead letters

### RabbitMQ Management UI

http://localhost:15672

**Dashboards:**
- Overview: Estatísticas gerais
- Queues: Status das filas
- Exchanges: Roteamento de mensagens
- Connections: Conexões ativas

## 🎓 Conceitos

### Event-Driven Architecture

- **Producer**: Emite eventos (Clients App)
- **Consumer**: Processa eventos (Transactions App)
- **Broker**: Gerencia mensagens (RabbitMQ)
- **Queue**: Armazena mensagens

### Vantagens

1. ✅ **Desacoplamento**: Serviços independentes
2. ✅ **Escalabilidade**: Fácil adicionar consumidores
3. ✅ **Resiliência**: Mensagens persistidas
4. ✅ **Flexibilidade**: Fácil adicionar funcionalidades

### Desvantagens

1. ⚠️ **Complexidade**: Mais componentes para gerenciar
2. ⚠️ **Debugging**: Mais difícil rastrear fluxo
3. ⚠️ **Eventual Consistency**: Dados podem estar desatualizados temporariamente

## 🔮 Próximos Passos

1. **Dead Letter Queue**: Tratar mensagens com erro
2. **Retry Policy**: Configurar retries automáticos
3. **Message TTL**: Expiração de mensagens antigas
4. **Priority Queues**: Priorizar mensagens importantes
5. **Multiple Exchanges**: Fan-out, Topic, Headers
6. **Sagas**: Transações distribuídas
7. **CQRS**: Separar comandos e queries

## 📚 Referências

- [NestJS Microservices](https://docs.nestjs.com/microservices/basics)
- [RabbitMQ Tutorials](https://www.rabbitmq.com/getstarted.html)
- [Event-Driven Architecture](https://martinfowler.com/articles/201701-event-driven.html)

