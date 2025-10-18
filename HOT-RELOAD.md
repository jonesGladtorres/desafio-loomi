# 🔥 Hot Reload no Docker - Guia Completo

## ❌ Problema Anterior

Antes, quando você fazia mudanças no código, precisava:
1. Parar o Docker (`docker-compose down`)
2. Rebuildar a imagem (`docker-compose up --build`)
3. Reiniciar tudo

Isso era lento e ineficiente para desenvolvimento!

## ✅ Solução: Hot Reload

Agora você tem **hot reload** configurado! As mudanças no código são aplicadas automaticamente sem precisar parar o Docker.

## 🚀 Como Usar

### Desenvolvimento com Hot Reload (Recomendado)

```bash
# Iniciar tudo com hot reload
make dev-full

# Ver logs em tempo real
make dev-full-logs

# Parar tudo
make dev-full-down
```

### Apenas Infraestrutura (sem apps)

```bash
# Iniciar apenas PostgreSQL, Redis e RabbitMQ
make dev-up

# Ver logs da infraestrutura
make dev-logs

# Parar infraestrutura
make dev-down
```

### Produção (sem hot reload)

```bash
# Ambiente de produção
make docker-up

# Ver logs de produção
make docker-logs

# Parar produção
make docker-down
```

## 🔧 Como Funciona

### 1. **Volumes Sincronizados**
- O código fonte é sincronizado entre seu host e o container
- Mudanças no host são refletidas imediatamente no container

### 2. **Watch Mode**
- O NestJS roda em modo `--watch`
- Detecta mudanças nos arquivos automaticamente
- Reinicia apenas a aplicação (não o container)

### 3. **Cache Otimizado**
- `node_modules` é cacheado em volume separado
- Evita reinstalação desnecessária de dependências

## 📁 Estrutura dos Volumes

```
Host (seu computador)          Container
├── apps/clients/        →    /app/apps/clients/
├── apps/transactions/   →    /app/apps/transactions/
├── libs/               →    /app/libs/
├── prisma/            →    /app/prisma/
├── package.json       →    /app/package.json
└── node_modules/      →    /app/node_modules/ (volume cacheado)
```

## 🌐 URLs Disponíveis

Após executar `make dev-full`:

- **Clients API**: http://localhost:3001/api/users
- **Transactions API**: http://localhost:3002/api/transactions
- **Swagger Clients**: http://localhost:3001/api/docs
- **Swagger Transactions**: http://localhost:3002/api/docs
- **RabbitMQ UI**: http://localhost:15672 (loomi_user/loomi_password)

## 🔄 Fluxo de Desenvolvimento

1. **Inicie o ambiente**:
   ```bash
   make dev-full
   ```

2. **Faça mudanças no código**:
   - Edite qualquer arquivo em `apps/clients/` ou `apps/transactions/`
   - As mudanças são detectadas automaticamente
   - A aplicação reinicia sozinha

3. **Teste as mudanças**:
   - Acesse as URLs da API
   - As mudanças já estão aplicadas!

4. **Veja os logs**:
   ```bash
   make dev-full-logs
   ```

## 🐛 Troubleshooting

### Container não inicia
```bash
# Limpar tudo e recomeçar
make dev-full-down
docker system prune -f
make dev-full
```

### Mudanças não são aplicadas
```bash
# Verificar se os volumes estão montados
docker-compose -f docker-compose.dev.yml ps
```

### Performance lenta
```bash
# Verificar se o cache está funcionando
docker volume ls | grep node_modules_dev
```

## 📊 Comparação: Antes vs Depois

| Aspecto | Antes (Produção) | Depois (Hot Reload) |
|---------|------------------|---------------------|
| **Tempo de mudança** | 30-60s | 2-5s |
| **Processo** | Stop → Build → Start | Automático |
| **Recursos** | Alto | Baixo |
| **Debugging** | Difícil | Fácil |
| **Produtividade** | Baixa | Alta |

## 🎯 Comandos Úteis

```bash
# Ver status dos containers
docker-compose -f docker-compose.dev.yml ps

# Entrar no container para debug
docker exec -it loomi-clients-app-dev sh

# Ver logs de um serviço específico
docker-compose -f docker-compose.dev.yml logs -f clients-app-dev

# Rebuildar apenas um serviço
docker-compose -f docker-compose.dev.yml up --build -d clients-app-dev
```

## 🚨 Importante

- **Desenvolvimento**: Use `make dev-full` (com hot reload)
- **Produção**: Use `make docker-up` (sem hot reload)
- **Testes**: Use `make dev-up` (apenas infraestrutura)

---

**Agora você pode desenvolver com eficiência máxima! 🚀**
