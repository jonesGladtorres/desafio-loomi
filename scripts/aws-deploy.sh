#!/bin/bash

# Script de deploy completo para AWS
# Este script faz o deploy de toda a infraestrutura e aplicações

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

# Verificar se AWS CLI está instalado
if ! command -v aws &> /dev/null; then
    log_error "AWS CLI não encontrado. Instale: https://aws.amazon.com/cli/"
fi

# Verificar se Terraform está instalado
if ! command -v terraform &> /dev/null; then
    log_error "Terraform não encontrado. Instale: https://www.terraform.io/downloads"
fi

# Verificar se Docker está rodando
if ! docker info &> /dev/null; then
    log_error "Docker não está rodando. Inicie o Docker e tente novamente."
fi

# Variáveis
AWS_REGION="${AWS_REGION:-us-east-1}"
ENVIRONMENT="${ENVIRONMENT:-production}"
TERRAFORM_DIR="terraform"

log_info "🚀 Iniciando deploy da aplicação Loomi para AWS"
echo ""
log_info "📋 Configuração:"
echo "   - Região: ${AWS_REGION}"
echo "   - Ambiente: ${ENVIRONMENT}"
echo ""

# Passo 1: Verificar credenciais AWS
log_info "🔑 Verificando credenciais AWS..."
if ! aws sts get-caller-identity &> /dev/null; then
    log_error "Credenciais AWS inválidas. Configure com 'aws configure'"
fi
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
log_success "Credenciais válidas (Account ID: ${AWS_ACCOUNT_ID})"
echo ""

# Passo 2: Terraform - Criar infraestrutura
log_info "🏗️  Criando infraestrutura com Terraform..."
cd "${TERRAFORM_DIR}"

if [ ! -f "terraform.tfvars" ]; then
    log_warning "Arquivo terraform.tfvars não encontrado. Criando a partir do exemplo..."
    if [ -f "terraform.tfvars.example" ]; then
        cp terraform.tfvars.example terraform.tfvars
        log_warning "ATENÇÃO: Edite o arquivo terraform.tfvars com suas senhas antes de continuar!"
        read -p "Pressione ENTER após editar o arquivo terraform.tfvars..."
    else
        log_error "Arquivo terraform.tfvars.example não encontrado!"
    fi
fi

log_info "Inicializando Terraform..."
terraform init

log_info "Validando configuração Terraform..."
terraform validate

log_info "Planejando mudanças..."
terraform plan -out=tfplan

read -p "Deseja aplicar as mudanças? (yes/no): " APPLY_TERRAFORM
if [ "$APPLY_TERRAFORM" != "yes" ]; then
    log_warning "Deploy cancelado pelo usuário."
    exit 0
fi

log_info "Aplicando infraestrutura..."
terraform apply tfplan

log_success "Infraestrutura criada com sucesso!"

# Obter outputs do Terraform
ECR_CLIENTS_URL=$(terraform output -raw ecr_clients_repository_url)
ECR_TRANSACTIONS_URL=$(terraform output -raw ecr_transactions_repository_url)
ECS_CLUSTER_NAME=$(terraform output -raw ecs_cluster_name)
ALB_DNS=$(terraform output -raw alb_dns_name)

cd ..
echo ""

# Passo 3: Build e push das imagens Docker
log_info "🐳 Fazendo build e push das imagens Docker..."

log_info "Fazendo login no ECR..."
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

log_info "Building imagem Clients..."
IMAGE_TAG=$(date +%Y%m%d-%H%M%S)
docker build --platform linux/amd64 -t loomi-clients -f apps/clients/Dockerfile .
docker tag loomi-clients:latest ${ECR_CLIENTS_URL}:latest
docker tag loomi-clients:latest ${ECR_CLIENTS_URL}:${IMAGE_TAG}

log_info "Pushing imagem Clients..."
docker push ${ECR_CLIENTS_URL}:latest
docker push ${ECR_CLIENTS_URL}:${IMAGE_TAG}

log_info "Building imagem Transactions..."
IMAGE_TAG=$(date +%Y%m%d-%H%M%S)
docker build --platform linux/amd64 -t loomi-transactions -f apps/transactions/Dockerfile .
docker tag loomi-transactions:latest ${ECR_TRANSACTIONS_URL}:latest
docker tag loomi-transactions:latest ${ECR_TRANSACTIONS_URL}:${IMAGE_TAG}

log_info "Pushing imagem Transactions..."
docker push ${ECR_TRANSACTIONS_URL}:latest
docker push ${ECR_TRANSACTIONS_URL}:${IMAGE_TAG}

log_success "Imagens enviadas para ECR!"
echo ""

# Passo 4: Executar migrations do Prisma
log_info "🗄️  Executando migrations do banco de dados..."
log_warning "IMPORTANTE: As migrations serão executadas automaticamente quando os containers iniciarem."
log_warning "Verifique os logs do ECS para confirmar que as migrations foram executadas com sucesso."
echo ""

# Passo 5: Atualizar serviços ECS
log_info "🔄 Atualizando serviços ECS..."

log_info "Forçando novo deployment do serviço Clients..."
aws ecs update-service \
    --cluster ${ECS_CLUSTER_NAME} \
    --service loomi-${ENVIRONMENT}-clients-service \
    --force-new-deployment \
    --region ${AWS_REGION} \
    > /dev/null

log_info "Forçando novo deployment do serviço Transactions..."
aws ecs update-service \
    --cluster ${ECS_CLUSTER_NAME} \
    --service loomi-${ENVIRONMENT}-transactions-service \
    --force-new-deployment \
    --region ${AWS_REGION} \
    > /dev/null

log_success "Serviços atualizados!"
echo ""

# Passo 6: Aguardar serviços ficarem estáveis
log_info "⏳ Aguardando serviços ficarem estáveis (isso pode levar alguns minutos)..."

log_info "Aguardando serviço Clients..."
aws ecs wait services-stable \
    --cluster ${ECS_CLUSTER_NAME} \
    --services loomi-${ENVIRONMENT}-clients-service \
    --region ${AWS_REGION}

log_info "Aguardando serviço Transactions..."
aws ecs wait services-stable \
    --cluster ${ECS_CLUSTER_NAME} \
    --services loomi-${ENVIRONMENT}-transactions-service \
    --region ${AWS_REGION}

log_success "Serviços estáveis e rodando!"
echo ""

# Resumo final
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║        🎉 Deploy Concluído com Sucesso!                       ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "📡 URLs da API:"
echo "   → ALB DNS ............. http://${ALB_DNS}"
echo "   → Clients API ......... http://${ALB_DNS}/api/users"
echo "   → Transactions API .... http://${ALB_DNS}/api/transactions"
echo ""
echo "📚 Documentação Swagger:"
echo "   → Clients API ......... http://${ALB_DNS}/api/docs"
echo "   → Transactions API .... http://${ALB_DNS}/api/docs"
echo ""
echo "🔧 Recursos AWS:"
echo "   → ECS Cluster ......... ${ECS_CLUSTER_NAME}"
echo "   → Região .............. ${AWS_REGION}"
echo "   → Account ID .......... ${AWS_ACCOUNT_ID}"
echo ""
echo "💡 Comandos Úteis:"
echo "   → Ver logs Clients .... ./scripts/aws-logs.sh clients"
echo "   → Ver logs Transactions ./scripts/aws-logs.sh transactions"
echo "   → Atualizar app ....... ./scripts/aws-update.sh"
echo "   → Destruir infraestr .. ./scripts/aws-destroy.sh"
echo ""

