terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Backend S3 para armazenar o estado do Terraform
  # Descomente e configure após criar o bucket S3
  # backend "s3" {
  #   bucket         = "loomi-terraform-state"
  #   key            = "production/terraform.tfstate"
  #   region         = "us-east-1"
  #   encrypt        = true
  #   dynamodb_table = "loomi-terraform-locks"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "Loomi"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# VPC e Networking
module "vpc" {
  source = "./modules/vpc"

  environment         = var.environment
  vpc_cidr           = var.vpc_cidr
  availability_zones = var.availability_zones
}

# Security Groups
module "security" {
  source = "./modules/security"

  environment = var.environment
  vpc_id      = module.vpc.vpc_id
}

# RDS PostgreSQL
module "rds" {
  source = "./modules/rds"

  environment             = var.environment
  vpc_id                  = module.vpc.vpc_id
  private_subnet_ids      = module.vpc.private_subnet_ids
  db_security_group_id    = module.security.db_security_group_id
  db_name                 = var.db_name
  db_username             = var.db_username
  db_password             = var.db_password
  db_instance_class       = var.db_instance_class
  db_allocated_storage    = var.db_allocated_storage
}

# ElastiCache Redis
module "elasticache" {
  source = "./modules/elasticache"

  environment               = var.environment
  vpc_id                    = module.vpc.vpc_id
  private_subnet_ids        = module.vpc.private_subnet_ids
  redis_security_group_id   = module.security.redis_security_group_id
  redis_node_type           = var.redis_node_type
  redis_num_cache_nodes     = var.redis_num_cache_nodes
}

# Amazon MQ (RabbitMQ)
module "amazonmq" {
  source = "./modules/amazonmq"

  environment           = var.environment
  vpc_id                = module.vpc.vpc_id
  private_subnet_ids    = module.vpc.private_subnet_ids
  mq_security_group_id  = module.security.mq_security_group_id
  mq_username           = var.mq_username
  mq_password           = var.mq_password
  mq_instance_type      = var.mq_instance_type
}

# ECR Repositories
module "ecr" {
  source = "./modules/ecr"

  environment = var.environment
}

# ECS Cluster
module "ecs" {
  source = "./modules/ecs"

  environment            = var.environment
  vpc_id                 = module.vpc.vpc_id
  public_subnet_ids      = module.vpc.public_subnet_ids
  private_subnet_ids     = module.vpc.private_subnet_ids
  alb_security_group_id  = module.security.alb_security_group_id
  ecs_security_group_id  = module.security.ecs_security_group_id
  
  # Container images (atualizar após primeiro push para ECR)
  clients_image         = "${module.ecr.clients_repository_url}:latest"
  transactions_image    = "${module.ecr.transactions_repository_url}:latest"
  
  # Environment variables
  database_url          = "postgresql://${var.db_username}:${var.db_password}@${module.rds.db_endpoint}/${var.db_name}?schema=public"
  redis_host            = module.elasticache.redis_endpoint
  redis_port            = 6379
  rabbitmq_url          = module.amazonmq.rabbitmq_url
  
  # Task resources
  clients_cpu           = var.clients_cpu
  clients_memory        = var.clients_memory
  transactions_cpu      = var.transactions_cpu
  transactions_memory   = var.transactions_memory
  
  # Auto scaling
  clients_desired_count     = var.clients_desired_count
  transactions_desired_count = var.transactions_desired_count
}

# CloudWatch Logs
resource "aws_cloudwatch_log_group" "clients" {
  name              = "/ecs/loomi-${var.environment}-clients"
  retention_in_days = 7

  tags = {
    Name = "loomi-${var.environment}-clients-logs"
  }
}

resource "aws_cloudwatch_log_group" "transactions" {
  name              = "/ecs/loomi-${var.environment}-transactions"
  retention_in_days = 7

  tags = {
    Name = "loomi-${var.environment}-transactions-logs"
  }
}

