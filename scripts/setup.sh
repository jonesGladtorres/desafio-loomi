#!/bin/bash

# Script de setup inicial do projeto
# Uso: bash scripts/setup.sh

set -e

echo "🚀 Iniciando setup do projeto Loomi..."
echo ""

# 1. Instalar dependências
echo "📦 Instalando dependências..."
npm install
echo "✅ Dependências instaladas!"
echo ""

# 2. Copiar .env.example para .env se não existir
if [ ! -f .env ]; then
  echo "📝 Criando arquivo .env..."
  cp .env.example .env
  echo "✅ Arquivo .env criado!"
else
  echo "ℹ️  Arquivo .env já existe, pulando..."
fi
echo ""

# 3. Iniciar serviços de infraestrutura
echo "🐳 Iniciando serviços Docker (PostgreSQL, Redis, RabbitMQ)..."
npm run docker:dev:up
echo "✅ Serviços iniciados!"
echo ""

# 4. Aguardar serviços ficarem prontos
echo "⏳ Aguardando serviços ficarem prontos..."
sleep 5
echo "✅ Serviços prontos!"
echo ""

# 5. Gerar Prisma Client
echo "🔧 Gerando Prisma Client..."
npm run prisma:generate
echo "✅ Prisma Client gerado!"
echo ""

# 6. Aplicar migrações
echo "📊 Aplicando migrações do banco de dados..."
npm run prisma:migrate:deploy
echo "✅ Migrações aplicadas!"
echo ""

# 7. Build das aplicações
echo "🔨 Fazendo build das aplicações..."
npm run build
echo "✅ Build concluído!"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Setup concluído com sucesso!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📚 Próximos passos:"
echo ""
echo "1. Iniciar aplicação Clients:"
echo "   npm run start:clients:dev"
echo ""
echo "2. Iniciar aplicação Transactions:"
echo "   npm run start:transactions:dev"
echo ""
echo "3. Acessar as APIs:"
echo "   - Clients: http://localhost:3001/api/users"
echo "   - Transactions: http://localhost:3002/api/transactions"
echo ""
echo "4. Gerenciar banco de dados:"
echo "   npm run prisma:studio"
echo ""
echo "5. Gerenciar RabbitMQ:"
echo "   http://localhost:15672 (loomi_user/loomi_password)"
echo ""
echo "📖 Para mais informações, consulte o README.md"
echo ""

