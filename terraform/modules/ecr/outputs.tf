output "clients_repository_url" {
  description = "URL do repositório ECR para Clients"
  value       = aws_ecr_repository.clients.repository_url
}

output "transactions_repository_url" {
  description = "URL do repositório ECR para Transactions"
  value       = aws_ecr_repository.transactions.repository_url
}

output "clients_repository_arn" {
  description = "ARN do repositório ECR para Clients"
  value       = aws_ecr_repository.clients.arn
}

output "transactions_repository_arn" {
  description = "ARN do repositório ECR para Transactions"
  value       = aws_ecr_repository.transactions.arn
}

