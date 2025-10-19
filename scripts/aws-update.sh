#!/bin/bash

# Script para atualizar apenas as aplicações (sem recriar infraestrutura)
# Útil para deploys rápidos de código

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções auxiliares
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
AWS_REGION="${AWS_REGION:-us-east-1}"
ENVIRONMENT="${ENVIRONMENT:-production}"
SERVICE="${1:-all}" # clients, transactions ou all

log_info "🔄 Atualizando aplicação Loomi na AWS"
echo ""

# Verificar credenciais AWS
log_info "🔑 Verificando credenciais AWS..."
if ! aws sts get-caller-identity &> /dev/null; then
    log_error "Credenciais AWS inválidas. Configure com 'aws configure'"
fi
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Obter outputs do Terraform
cd terraform
ECR_CLIENTS_URL=$(terraform output -raw ecr_clients_repository_url)
ECR_TRANSACTIONS_URL=$(terraform output -raw ecr_transactions_repository_url)
ECS_CLUSTER_NAME=$(terraform output -raw ecs_cluster_name)
cd ..

# Login no ECR
log_info "Fazendo login no ECR..."
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

# Build e push - Clients
if [ "$SERVICE" == "all" ] || [ "$SERVICE" == "clients" ]; then
    log_info "🐳 Building e pushing imagem Clients..."
    IMAGE_TAG=$(date +%Y%m%d-%H%M%S)
    docker build --platform linux/amd64 -t loomi-clients -f apps/clients/Dockerfile .
    docker tag loomi-clients:latest ${ECR_CLIENTS_URL}:latest
    docker tag loomi-clients:latest ${ECR_CLIENTS_URL}:${IMAGE_TAG}
    docker push ${ECR_CLIENTS_URL}:latest
    docker push ${ECR_CLIENTS_URL}:${IMAGE_TAG}
    log_success "Imagem Clients enviada!"

    log_info "Atualizando serviço Clients no ECS..."
    aws ecs update-service \
        --cluster ${ECS_CLUSTER_NAME} \
        --service loomi-${ENVIRONMENT}-clients-service \
        --force-new-deployment \
        --region ${AWS_REGION} \
        > /dev/null
    log_success "Serviço Clients atualizado!"
fi

# Build e push - Transactions
if [ "$SERVICE" == "all" ] || [ "$SERVICE" == "transactions" ]; then
    log_info "🐳 Building e pushing imagem Transactions..."
    IMAGE_TAG=$(date +%Y%m%d-%H%M%S)
    docker build --platform linux/amd64 -t loomi-transactions -f apps/transactions/Dockerfile .
    docker tag loomi-transactions:latest ${ECR_TRANSACTIONS_URL}:latest
    docker tag loomi-transactions:latest ${ECR_TRANSACTIONS_URL}:${IMAGE_TAG}
    docker push ${ECR_TRANSACTIONS_URL}:latest
    docker push ${ECR_TRANSACTIONS_URL}:${IMAGE_TAG}
    log_success "Imagem Transactions enviada!"

    log_info "Atualizando serviço Transactions no ECS..."
    aws ecs update-service \
        --cluster ${ECS_CLUSTER_NAME} \
        --service loomi-${ENVIRONMENT}-transactions-service \
        --force-new-deployment \
        --region ${AWS_REGION} \
        > /dev/null
    log_success "Serviço Transactions atualizado!"
fi

echo ""
log_success "Atualização concluída! Os novos containers serão implantados em alguns minutos."
log_info "Use './scripts/aws-logs.sh' para acompanhar o deployment."

