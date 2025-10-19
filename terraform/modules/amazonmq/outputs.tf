output "rabbitmq_endpoint" {
  description = "Endpoint do Amazon MQ RabbitMQ"
  value       = aws_mq_broker.rabbitmq.instances[0].endpoints[0]
}

output "rabbitmq_url" {
  description = "URL de conexão do RabbitMQ"
  value       = replace(aws_mq_broker.rabbitmq.instances[0].endpoints[0], "amqps://", "amqps://${var.mq_username}:${var.mq_password}@")
}

output "rabbitmq_console_url" {
  description = "URL do console do RabbitMQ"
  value       = aws_mq_broker.rabbitmq.instances[0].console_url
}

