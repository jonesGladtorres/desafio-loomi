#!/bin/bash

# Script para visualizar logs dos serviços no AWS CloudWatch

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Variáveis
AWS_REGION="${AWS_REGION:-us-east-1}"
ENVIRONMENT="${ENVIRONMENT:-production}"
SERVICE="${1:-clients}" # clients ou transactions

if [ "$SERVICE" != "clients" ] && [ "$SERVICE" != "transactions" ]; then
    log_error "Uso: $0 [clients|transactions]"
fi

LOG_GROUP="/ecs/loomi-${ENVIRONMENT}-${SERVICE}"

log_info "📋 Visualizando logs do serviço ${SERVICE}..."
log_info "Log Group: ${LOG_GROUP}"
echo ""

# Verificar se AWS CLI está instalado
if ! command -v aws &> /dev/null; then
    log_error "AWS CLI não encontrado. Instale: https://aws.amazon.com/cli/"
fi

# Tail dos logs
aws logs tail ${LOG_GROUP} \
    --follow \
    --format short \
    --region ${AWS_REGION}

