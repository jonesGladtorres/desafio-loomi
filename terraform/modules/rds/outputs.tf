output "db_endpoint" {
  description = "Endpoint do banco de dados"
  value       = aws_db_instance.postgresql.endpoint
}

output "db_address" {
  description = "Endereço do banco de dados"
  value       = aws_db_instance.postgresql.address
}

output "db_port" {
  description = "Porta do banco de dados"
  value       = aws_db_instance.postgresql.port
}

output "db_name" {
  description = "Nome do banco de dados"
  value       = aws_db_instance.postgresql.db_name
}

