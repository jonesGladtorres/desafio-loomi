# 🏗️ Infraestrutura Terraform

Esta pasta contém toda a infraestrutura como código (IaC) para deploy na AWS.

## 📁 Estrutura

```
terraform/
├── main.tf                    # Configuração principal
├── variables.tf               # Variáveis
├── outputs.tf                 # Outputs
├── terraform.tfvars.example   # Exemplo de variáveis
├── terraform.tfvars           # Suas variáveis (não commitar!)
└── modules/
    ├── vpc/                   # VPC e networking
    ├── security/              # Security groups
    ├── rds/                   # PostgreSQL RDS
    ├── elasticache/           # Redis ElastiCache
    ├── amazonmq/              # RabbitMQ Amazon MQ
    ├── ecr/                   # Container registry
    └── ecs/                   # ECS Fargate + ALB
```

## 🚀 Quick Start

```bash
# 1. Copiar variáveis de exemplo
cp terraform.tfvars.example terraform.tfvars

# 2. Editar com suas configurações
nano terraform.tfvars

# 3. Inicializar Terraform
terraform init

# 4. Visualizar mudanças
terraform plan

# 5. Aplicar
terraform apply
```

## 📋 Módulos

### VPC Module
Cria rede VPC completa com:
- 2 subnets públicas (multi-AZ)
- 2 subnets privadas (multi-AZ)
- Internet Gateway
- 2 NAT Gateways
- Route tables

### Security Module
Security groups para:
- Application Load Balancer
- ECS Tasks
- RDS PostgreSQL
- ElastiCache Redis
- Amazon MQ

### RDS Module
PostgreSQL 16 gerenciado:
- Multi-AZ em produção
- Backups automáticos (7 dias)
- Encryption at rest
- CloudWatch logs

### ElastiCache Module
Redis 7 cluster:
- Subnet group em AZs privadas
- Snapshots automáticos
- CloudWatch monitoring

### Amazon MQ Module
RabbitMQ gerenciado:
- Single instance (dev) ou Multi-AZ (prod)
- Logs habilitados
- Manutenção automática

### ECR Module
Container registry:
- Repositórios privados
- Scan de vulnerabilidades
- Lifecycle policies (manter 10 últimas imagens)

### ECS Module
Orquestração de containers:
- ECS Cluster com Container Insights
- Application Load Balancer
- 2 serviços (Clients e Transactions)
- Auto scaling baseado em CPU
- Health checks

## 🔧 Variáveis Importantes

### Obrigatórias

```hcl
db_password = "SuaSenhaForte123!@#"  # Senha do PostgreSQL
mq_password = "SuaSenhaForte456!@#"  # Senha do RabbitMQ
```

### Opcionais (com defaults)

```hcl
aws_region  = "us-east-1"
environment = "production"

# RDS
db_instance_class    = "db.t3.micro"
db_allocated_storage = 20

# ECS
clients_cpu           = "256"   # 0.25 vCPU
clients_memory        = "512"   # 512 MB
clients_desired_count = 2

transactions_cpu           = "256"
transactions_memory        = "512"
transactions_desired_count = 2
```

## 📤 Outputs

Após `terraform apply`:

```bash
# Ver todos outputs
terraform output

# Output específico
terraform output alb_dns_name
terraform output ecr_clients_repository_url
terraform output rds_endpoint
```

Outputs disponíveis:
- `alb_dns_name` - DNS do Load Balancer
- `clients_api_url` - URL da API de Clientes
- `transactions_api_url` - URL da API de Transações
- `clients_swagger_url` - URL do Swagger Clients
- `transactions_swagger_url` - URL do Swagger Transactions
- `ecr_clients_repository_url` - URL do ECR para Clients
- `ecr_transactions_repository_url` - URL do ECR para Transactions
- `vpc_id` - ID da VPC criada
- `ecs_cluster_name` - Nome do cluster ECS

## 🔒 Backend State

Por padrão, o state é armazenado localmente. Para produção, recomenda-se usar S3:

### Configurar S3 Backend

```bash
# 1. Criar bucket S3
aws s3 mb s3://loomi-terraform-state --region us-east-1

# 2. Habilitar versionamento
aws s3api put-bucket-versioning \
  --bucket loomi-terraform-state \
  --versioning-configuration Status=Enabled

# 3. Criar tabela DynamoDB para locks
aws dynamodb create-table \
  --table-name loomi-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST

# 4. Descomentar backend no main.tf
```

Em `main.tf`, descomentar:

```hcl
terraform {
  backend "s3" {
    bucket         = "loomi-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "loomi-terraform-locks"
  }
}
```

Então:

```bash
terraform init -migrate-state
```

## 🎯 Ambientes

### Criar ambiente Staging

```bash
# Criar arquivo de variáveis
cp terraform.tfvars terraform.staging.tfvars

# Editar
nano terraform.staging.tfvars
# Mudar: environment = "staging"

# Aplicar
terraform apply -var-file="terraform.staging.tfvars"
```

### Workspaces (alternativa)

```bash
# Criar workspace staging
terraform workspace new staging
terraform workspace select staging
terraform apply -var="environment=staging"

# Voltar para default (production)
terraform workspace select default
```

## 🧹 Limpeza

```bash
# Destruir tudo
terraform destroy

# Destruir recurso específico
terraform destroy -target=module.ecs
```

## 📊 Custos

Estimativa mensal (us-east-1):

| Recurso | Custo |
|---------|-------|
| ECS Fargate (4 tasks) | ~$30 |
| ALB | ~$20 |
| RDS db.t3.micro | ~$15 |
| ElastiCache t3.micro | ~$12 |
| Amazon MQ t3.micro | ~$18 |
| NAT Gateways (2) | ~$65 |
| Outros | ~$10 |
| **Total** | **~$170** |

## 🔍 Troubleshooting

### Erro: "Error creating VPC"

```bash
# Verificar limites da conta
aws service-quotas list-service-quotas \
  --service-code vpc \
  --query 'Quotas[?QuotaName==`VPCs per Region`]'
```

### Erro: "Backend configuration changed"

```bash
terraform init -reconfigure
```

### Erro: "State lock"

```bash
# Remover lock (cuidado!)
terraform force-unlock <LOCK_ID>
```

### Terraform state corrompido

```bash
# Backup
cp terraform.tfstate terraform.tfstate.backup

# Importar recurso novamente
terraform import module.vpc.aws_vpc.main vpc-xxxxx
```

## 📚 Recursos

- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Terraform Best Practices](https://www.terraform-best-practices.com/)
- [AWS Well-Architected](https://aws.amazon.com/architecture/well-architected/)

## ⚠️ Avisos

1. **Nunca commite `terraform.tfvars`** - Contém senhas
2. **Sempre use `terraform plan`** antes de `apply`
3. **Backups**: Habilite backups antes de `destroy`
4. **Custos**: Monitore custos no AWS Cost Explorer

---

**Desenvolvido com ❤️ por Jones Torres para Loomi**

