.PHONY: help setup install build test lint docker-up docker-down docker-logs

# Default target
help:
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "  Desafio Loomi - NestJS Monorepo"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo ""
	@echo "🚀 Setup"
	@echo "  make setup              - Configuração automática completa"
	@echo "  make install            - Instalar dependências"
	@echo ""
	@echo "🐳 Docker - Desenvolvimento"
	@echo "  make dev-up             - Iniciar infraestrutura (postgres, redis, rabbitmq)"
	@echo "  make dev-down           - Parar infraestrutura"
	@echo "  make dev-logs           - Ver logs da infraestrutura"
	@echo "  make dev-full           - Iniciar tudo com hot reload (apps + infraestrutura)"
	@echo "  make dev-full-down      - Parar tudo (apps + infraestrutura)"
	@echo "  make dev-full-logs      - Ver logs de tudo"
	@echo ""
	@echo "🐳 Docker - Produção"
	@echo "  make docker-up          - Build e iniciar todos os serviços"
	@echo "  make docker-down        - Parar todos os serviços"
	@echo "  make docker-logs        - Ver logs de todos os serviços"
	@echo "  make docker-ps          - Status dos containers"
	@echo "  make docker-clean       - Limpar tudo (volumes + imagens)"
	@echo ""
	@echo "🗄️  Prisma"
	@echo "  make prisma-generate    - Gerar Prisma Client"
	@echo "  make prisma-migrate     - Criar e aplicar migração"
	@echo "  make prisma-deploy      - Aplicar migrações (produção)"
	@echo "  make prisma-studio      - Abrir Prisma Studio"
	@echo ""
	@echo "🔨 Build"
	@echo "  make build              - Build de todas as aplicações"
	@echo "  make build-clients      - Build do app clients"
	@echo "  make build-transactions - Build do app transactions"
	@echo ""
	@echo "▶️  Run"
	@echo "  make start-clients      - Iniciar app clients (watch mode)"
	@echo "  make start-transactions - Iniciar app transactions (watch mode)"
	@echo ""
	@echo "🧪 Testes"
	@echo "  make test               - Executar testes unitários"
	@echo "  make test-e2e           - Executar testes E2E"
	@echo "  make test-cov           - Testes com cobertura"
	@echo ""
	@echo "🔍 Qualidade"
	@echo "  make lint               - Lint e fix"
	@echo "  make format             - Formatar código"
	@echo ""
	@echo "🐰 RabbitMQ"
	@echo "  make rabbitmq-status    - Status do RabbitMQ"
	@echo "  make rabbitmq-logs      - Logs de eventos"
	@echo "  make rabbitmq-monitor   - Monitoramento em tempo real"
	@echo "  make rabbitmq-ui        - Abrir interface web"
	@echo "  make rabbitmq-test      - Teste completo de mensageria"
	@echo ""

# Setup
setup:
	@bash scripts/setup.sh

install:
	@npm install

# Docker - Desenvolvimento
dev-up:
	@docker-compose -f docker-compose.dev.yml up -d
	@echo "✅ Infraestrutura iniciada!"
	@echo "   - PostgreSQL: localhost:5432"
	@echo "   - Redis: localhost:6379"
	@echo "   - RabbitMQ: localhost:5672"
	@echo "   - RabbitMQ UI: http://localhost:15672"

dev-down:
	@docker-compose -f docker-compose.dev.yml down
	@echo "✅ Infraestrutura parada!"

dev-logs:
	@docker-compose -f docker-compose.dev.yml logs -f

# Docker - Desenvolvimento Completo (com Hot Reload)
dev-full:
	@docker-compose -f docker-compose.dev.yml up --build -d
	@echo "✅ Desenvolvimento completo iniciado com hot reload!"
	@echo "   - PostgreSQL: localhost:5432"
	@echo "   - Redis: localhost:6379"
	@echo "   - RabbitMQ: localhost:5672"
	@echo "   - RabbitMQ UI: http://localhost:15672"
	@echo "   - Clients API: http://localhost:3001/api/users"
	@echo "   - Transactions API: http://localhost:3002/api/transactions"
	@echo ""
	@echo "🔥 Hot reload ativo! As mudanças no código serão aplicadas automaticamente."

dev-full-down:
	@docker-compose -f docker-compose.dev.yml down
	@echo "✅ Desenvolvimento completo parado!"

dev-full-logs:
	@docker-compose -f docker-compose.dev.yml logs -f

# Docker - Produção
docker-up:
	@docker-compose up --build -d
	@echo "✅ Todos os serviços iniciados!"
	@echo "   - Clients API: http://localhost:3001"
	@echo "   - Transactions API: http://localhost:3002"
	@echo "   - RabbitMQ UI: http://localhost:15672"

docker-down:
	@docker-compose down
	@echo "✅ Todos os serviços parados!"

docker-logs:
	@docker-compose logs -f

docker-ps:
	@docker-compose ps

docker-clean:
	@docker-compose down -v --rmi all
	@echo "✅ Tudo limpo!"

# Prisma
prisma-generate:
	@npm run prisma:generate

prisma-migrate:
	@npm run prisma:migrate

prisma-deploy:
	@npm run prisma:migrate:deploy

prisma-studio:
	@npm run prisma:studio

# Build
build:
	@npm run build

build-clients:
	@npm run build:clients

build-transactions:
	@npm run build:transactions

# Run
start-clients:
	@npm run start:clients:dev

start-transactions:
	@npm run start:transactions:dev

# Testes
test:
	@npm run test

test-e2e:
	@npm run test:e2e:clients
	@npm run test:e2e:transactions

test-cov:
	@npm run test:cov

# Qualidade
lint:
	@npm run lint

format:
	@npm run format

# RabbitMQ
rabbitmq-status:
	@bash scripts/monitor-rabbitmq.sh status

rabbitmq-logs:
	@bash scripts/monitor-rabbitmq.sh logs

rabbitmq-monitor:
	@bash scripts/monitor-rabbitmq.sh monitor

rabbitmq-ui:
	@echo "🌐 Abrindo RabbitMQ Management UI..."
	@echo "   URL: http://localhost:15672"
	@echo "   Usuário: loomi_user"
	@echo "   Senha: loomi_password"
	@open http://localhost:15672 2>/dev/null || xdg-open http://localhost:15672 2>/dev/null || echo "Abra manualmente: http://localhost:15672"

rabbitmq-test:
	@bash scripts/test-rabbitmq.sh

