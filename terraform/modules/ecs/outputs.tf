output "cluster_id" {
  description = "ID do cluster ECS"
  value       = aws_ecs_cluster.main.id
}

output "cluster_name" {
  description = "Nome do cluster ECS"
  value       = aws_ecs_cluster.main.name
}

output "alb_dns_name" {
  description = "DNS do Application Load Balancer"
  value       = aws_lb.main.dns_name
}

output "alb_zone_id" {
  description = "Zone ID do Application Load Balancer"
  value       = aws_lb.main.zone_id
}

output "clients_service_name" {
  description = "Nome do serviço ECS para Clients"
  value       = aws_ecs_service.clients.name
}

output "transactions_service_name" {
  description = "Nome do serviço ECS para Transactions"
  value       = aws_ecs_service.transactions.name
}

