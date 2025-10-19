#!/bin/bash

# Script para destruir toda a infraestrutura AWS
# ⚠️  CUIDADO: Este script irá deletar TODOS os recursos criados!

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Variáveis
TERRAFORM_DIR="terraform"

echo ""
log_warning "═══════════════════════════════════════════════════════════"
log_warning "  ATENÇÃO: VOCÊ ESTÁ PRESTES A DESTRUIR A INFRAESTRUTURA"
log_warning "═══════════════════════════════════════════════════════════"
echo ""
log_warning "Esta ação irá:"
echo "   - Deletar todos os serviços ECS"
echo "   - Deletar o Application Load Balancer"
echo "   - Deletar o banco de dados RDS (e todos os dados!)"
echo "   - Deletar o cache Redis"
echo "   - Deletar o Amazon MQ (RabbitMQ)"
echo "   - Deletar as imagens Docker do ECR"
echo "   - Deletar toda a rede VPC"
echo ""
log_warning "⚠️  ESTA AÇÃO NÃO PODE SER DESFEITA! ⚠️"
echo ""

read -p "Digite 'DESTRUIR' para confirmar: " CONFIRM

if [ "$CONFIRM" != "DESTRUIR" ]; then
    log_info "Operação cancelada."
    exit 0
fi

echo ""
log_info "🗑️  Iniciando destruição da infraestrutura..."
echo ""

cd "${TERRAFORM_DIR}"

log_info "Executando terraform destroy..."
terraform destroy -auto-approve

cd ..

echo ""
log_success "Infraestrutura destruída com sucesso!"
log_info "Todos os recursos foram removidos da AWS."

