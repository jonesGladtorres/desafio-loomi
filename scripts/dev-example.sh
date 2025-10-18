#!/bin/bash

echo "🚀 Exemplo de uso do Hot Reload no Docker"
echo "=========================================="
echo ""

echo "1️⃣ Para iniciar o ambiente de desenvolvimento com hot reload:"
echo "   make dev-full"
echo ""

echo "2️⃣ Para ver os logs em tempo real:"
echo "   make dev-full-logs"
echo ""

echo "3️⃣ Para parar tudo:"
echo "   make dev-full-down"
echo ""

echo "4️⃣ Para apenas a infraestrutura (sem as apps):"
echo "   make dev-up"
echo ""

echo "5️⃣ Para ver apenas logs da infraestrutura:"
echo "   make dev-logs"
echo ""

echo "📝 URLs disponíveis após iniciar:"
echo "   - Clients API: http://localhost:3001/api/users"
echo "   - Transactions API: http://localhost:3002/api/transactions"
echo "   - RabbitMQ UI: http://localhost:15672 (loomi_user/loomi_password)"
echo "   - Swagger Clients: http://localhost:3001/api/docs"
echo "   - Swagger Transactions: http://localhost:3002/api/docs"
echo ""

echo "🔥 Com hot reload ativo:"
echo "   - Faça mudanças no código"
echo "   - As mudanças serão aplicadas automaticamente"
echo "   - Não precisa parar e reiniciar o Docker!"
echo ""

echo "💡 Dicas:"
echo "   - Use 'make dev-full' para desenvolvimento completo"
echo "   - Use 'make docker-up' para ambiente de produção"
echo "   - Os volumes sincronizam o código fonte automaticamente"
echo ""
