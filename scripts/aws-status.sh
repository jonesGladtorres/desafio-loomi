#!/bin/bash

# Script para verificar o status dos serviços na AWS

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

log_error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Variáveis
AWS_REGION="${AWS_REGION:-us-east-1}"
ENVIRONMENT="${ENVIRONMENT:-production}"

log_info "📊 Verificando status dos serviços Loomi na AWS"
echo ""

# Verificar credenciais AWS
if ! aws sts get-caller-identity &> /dev/null; then
    log_error "Credenciais AWS inválidas. Configure com 'aws configure'"
fi

# Obter outputs do Terraform
cd terraform
if [ ! -f "terraform.tfstate" ]; then
    log_error "Terraform state não encontrado. Execute ./scripts/aws-deploy.sh primeiro."
fi

ECS_CLUSTER_NAME=$(terraform output -raw ecs_cluster_name 2>/dev/null || echo "")
ALB_DNS=$(terraform output -raw alb_dns_name 2>/dev/null || echo "")

if [ -z "$ECS_CLUSTER_NAME" ]; then
    log_error "Infraestrutura não encontrada. Execute ./scripts/aws-deploy.sh primeiro."
fi

cd ..

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                 Status dos Serviços Loomi                      ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Status do Cluster ECS
log_info "🔍 Cluster ECS: ${ECS_CLUSTER_NAME}"
echo ""

# Status dos serviços
log_info "📦 Serviço Clients:"
aws ecs describe-services \
    --cluster ${ECS_CLUSTER_NAME} \
    --services loomi-${ENVIRONMENT}-clients-service \
    --region ${AWS_REGION} \
    --query 'services[0].[serviceName,status,runningCount,desiredCount,deployments[0].rolloutState]' \
    --output table

echo ""
log_info "📦 Serviço Transactions:"
aws ecs describe-services \
    --cluster ${ECS_CLUSTER_NAME} \
    --services loomi-${ENVIRONMENT}-transactions-service \
    --region ${AWS_REGION} \
    --query 'services[0].[serviceName,status,runningCount,desiredCount,deployments[0].rolloutState]' \
    --output table

echo ""
log_info "🌐 URLs:"
echo "   → ALB DNS ............. http://${ALB_DNS}"
echo "   → Clients API ......... http://${ALB_DNS}/api/users"
echo "   → Transactions API .... http://${ALB_DNS}/api/transactions"
echo "   → Clients Swagger ..... http://${ALB_DNS}/api/docs/users"
echo "   → Transactions Swagger  http://${ALB_DNS}/api/docs/transactions"
echo ""
log_info "🔍 Para diagnóstico completo, execute: ./scripts/aws-diagnose.sh"
echo ""

