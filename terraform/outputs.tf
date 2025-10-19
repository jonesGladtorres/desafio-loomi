output "alb_dns_name" {
  description = "DNS do Application Load Balancer"
  value       = module.ecs.alb_dns_name
}

output "clients_api_url" {
  description = "URL da API de Clientes"
  value       = "http://${module.ecs.alb_dns_name}/api/users"
}

output "transactions_api_url" {
  description = "URL da API de Transações"
  value       = "http://${module.ecs.alb_dns_name}/api/transactions"
}

output "clients_swagger_url" {
  description = "URL do Swagger da API de Clientes"
  value       = "http://${module.ecs.alb_dns_name}/api/docs/users"
}

output "transactions_swagger_url" {
  description = "URL do Swagger da API de Transações"
  value       = "http://${module.ecs.alb_dns_name}/api/docs/transactions"
}

output "ecr_clients_repository_url" {
  description = "URL do repositório ECR para Clients"
  value       = module.ecr.clients_repository_url
}

output "ecr_transactions_repository_url" {
  description = "URL do repositório ECR para Transactions"
  value       = module.ecr.transactions_repository_url
}

output "rds_endpoint" {
  description = "Endpoint do RDS PostgreSQL"
  value       = module.rds.db_endpoint
  sensitive   = true
}

output "redis_endpoint" {
  description = "Endpoint do ElastiCache Redis"
  value       = module.elasticache.redis_endpoint
  sensitive   = true
}

output "rabbitmq_endpoint" {
  description = "Endpoint do Amazon MQ RabbitMQ"
  value       = module.amazonmq.rabbitmq_endpoint
  sensitive   = true
}

output "vpc_id" {
  description = "ID da VPC"
  value       = module.vpc.vpc_id
}

output "ecs_cluster_name" {
  description = "Nome do cluster ECS"
  value       = module.ecs.cluster_name
}

