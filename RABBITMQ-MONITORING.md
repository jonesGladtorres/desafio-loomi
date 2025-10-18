# 🐰 Monitoramento do RabbitMQ - Guia Completo

## 🌐 **1. RabbitMQ Management UI (Interface Web)**

### Acessar a Interface:
- **URL**: http://localhost:15672
- **Usuário**: `loomi_user`
- **Senha**: `loomi_password`

### O que você pode ver:
- ✅ **Overview**: Status geral do RabbitMQ
- ✅ **Connections**: Conexões ativas das aplicações
- ✅ **Channels**: Canais de comunicação
- ✅ **Exchanges**: Roteamento de mensagens
- ✅ **Queues**: Filas de mensagens
- ✅ **Messages**: Mensagens em trânsito

## 📊 **2. Monitoramento via Logs**

### Ver logs do RabbitMQ:
```bash
# Logs do RabbitMQ
docker logs loomi-rabbitmq-dev -f

# Logs da aplicação Clients (emite eventos)
docker logs loomi-clients-app-dev -f

# Logs da aplicação Transactions (recebe eventos)
docker logs loomi-transactions-app-dev -f
```

### Logs importantes a observar:
```
📤 Evento 'user_banking_updated' emitido para o usuário 123e4567-e89b-12d3-a456-426614174000
📥 Evento recebido: user_banking_updated
📋 Dados do evento: { userId: '...', name: '...', email: '...' }
```

## 🔍 **3. Testando a Mensageria**

### Cenários que disparam eventos:

#### **1. Atualizar dados bancários de um usuário:**
```bash
# PATCH /api/users/{id} com dados bancários
curl -X PATCH http://localhost:3001/api/users/123e4567-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json" \
  -d '{
    "bankAgency": "0002",
    "bankAccount": "54321",
    "bankAccountDigit": "9"
  }'
```

#### **2. Atualizar CPF de um usuário:**
```bash
# PATCH /api/users/{id} com CPF
curl -X PATCH http://localhost:3001/api/users/123e4567-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json" \
  -d '{
    "cpf": "123.456.789-09"
  }'
```

#### **3. Atualizar endereço de um usuário:**
```bash
# PATCH /api/users/{id} com endereço
curl -X PATCH http://localhost:3001/api/users/123e4567-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json" \
  -d '{
    "address": "Nova Rua, 456",
    "city": "Rio de Janeiro",
    "state": "RJ"
  }'
```

## 🛠️ **4. Comandos de Monitoramento**

### Verificar status dos containers:
```bash
# Status dos containers
docker-compose -f docker-compose.dev.yml ps

# Verificar se RabbitMQ está saudável
docker exec loomi-rabbitmq-dev rabbitmq-diagnostics ping
```

### Verificar filas:
```bash
# Listar filas
docker exec loomi-rabbitmq-dev rabbitmqctl list_queues

# Ver mensagens em uma fila específica
docker exec loomi-rabbitmq-dev rabbitmqctl list_queues name messages
```

### Verificar exchanges:
```bash
# Listar exchanges
docker exec loomi-rabbitmq-dev rabbitmqctl list_exchanges
```

## 📱 **5. Interface RabbitMQ Management - Guia Visual**

### **Overview Tab:**
- **Total Messages**: Total de mensagens processadas
- **Message Rates**: Taxa de mensagens por segundo
- **Connections**: Conexões ativas (deve mostrar 2: clients + transactions)

### **Queues Tab:**
- **user_events_queue**: Fila principal de eventos
- **Messages**: Número de mensagens na fila
- **Consumers**: Número de consumidores (deve ser 1: transactions app)

### **Exchanges Tab:**
- **amq.topic**: Exchange padrão para roteamento
- **Bindings**: Ligações entre exchanges e filas

## 🧪 **6. Teste Completo de Fluxo**

### Passo a passo para testar:

1. **Iniciar ambiente:**
   ```bash
   make dev-full
   ```

2. **Abrir RabbitMQ Management:**
   - Acesse: http://localhost:15672
   - Login: `loomi_user` / `loomi_password`

3. **Criar um usuário:**
   ```bash
   curl -X POST http://localhost:3001/api/users \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Teste RabbitMQ",
       "email": "teste.rabbitmq@example.com",
       "cpf": "123.456.789-09"
     }'
   ```

4. **Atualizar dados bancários (dispara evento):**
   ```bash
   curl -X PATCH http://localhost:3001/api/users/{USER_ID} \
     -H "Content-Type: application/json" \
     -d '{
       "bankAgency": "0003",
       "bankAccount": "99999",
       "bankAccountDigit": "1"
     }'
   ```

5. **Observar nos logs:**
   ```bash
   # Terminal 1 - Logs do Clients (emite evento)
   docker logs loomi-clients-app-dev -f
   
   # Terminal 2 - Logs do Transactions (recebe evento)
   docker logs loomi-transactions-app-dev -f
   ```

6. **Verificar no RabbitMQ Management:**
   - Vá para **Queues** tab
   - Observe a fila `user_events_queue`
   - Veja as mensagens sendo processadas

## 🔧 **7. Troubleshooting**

### RabbitMQ não está funcionando:
```bash
# Reiniciar RabbitMQ
docker restart loomi-rabbitmq-dev

# Verificar logs de erro
docker logs loomi-rabbitmq-dev --tail 50
```

### Aplicações não conectam:
```bash
# Verificar se as aplicações estão rodando
docker-compose -f docker-compose.dev.yml ps

# Verificar logs de conexão
docker logs loomi-clients-app-dev | grep -i rabbit
docker logs loomi-transactions-app-dev | grep -i rabbit
```

### Mensagens não são processadas:
```bash
# Verificar se a fila existe
docker exec loomi-rabbitmq-dev rabbitmqctl list_queues

# Verificar consumidores
docker exec loomi-rabbitmq-dev rabbitmqctl list_consumers
```

## 📈 **8. Métricas Importantes**

### No RabbitMQ Management UI:
- **Message Rates**: Deve mostrar atividade quando eventos são emitidos
- **Queue Depth**: Número de mensagens pendentes
- **Consumer Count**: Deve ser 1 para `user_events_queue`
- **Connection Count**: Deve ser 2 (clients + transactions)

### Nos logs das aplicações:
- **Clients**: `📤 Evento 'user_banking_updated' emitido`
- **Transactions**: `📥 Evento recebido: user_banking_updated`

---

**Agora você tem todas as ferramentas para monitorar o RabbitMQ! 🚀**
