#!/bin/bash

# Script para executar migrations do Prisma no RDS da AWS
# Este script conecta diretamente no banco de dados RDS e cria as tabelas

set -e

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🗄️  Executando migrations do Prisma no RDS...${NC}"
echo ""

# Configurar DATABASE_URL
export DATABASE_URL="postgresql://loomi_user:123123123123aa@loomi-production-postgres.cqzo8osi8yql.us-east-1.rds.amazonaws.com:5432/loomi_db?schema=public"

# Executar migrations
echo -e "${BLUE}📦 Gerando Prisma Client...${NC}"
npx prisma generate

echo ""
echo -e "${BLUE}🚀 Aplicando migrations no banco de dados...${NC}"
npx prisma migrate deploy

echo ""
echo -e "${GREEN}✅ Migrations executadas com sucesso!${NC}"
echo ""
echo -e "${YELLOW}Agora seus containers ECS devem conseguir conectar no banco de dados.${NC}"
echo -e "${YELLOW}As APIs já devem estar funcionando em:${NC}"
echo ""
echo "📡 Clients API: http://loomi-production-alb-821513995.us-east-1.elb.amazonaws.com/api/users"
echo "📡 Transactions API: http://loomi-production-alb-821513995.us-east-1.elb.amazonaws.com/api/transactions"
echo "📚 Swagger: http://loomi-production-alb-821513995.us-east-1.elb.amazonaws.com/api/docs"
echo ""

