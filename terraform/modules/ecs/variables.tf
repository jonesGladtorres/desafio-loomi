variable "environment" {
  description = "Ambiente"
  type        = string
}

variable "vpc_id" {
  description = "ID da VPC"
  type        = string
}

variable "public_subnet_ids" {
  description = "IDs das subnets públicas"
  type        = list(string)
}

variable "private_subnet_ids" {
  description = "IDs das subnets privadas"
  type        = list(string)
}

variable "alb_security_group_id" {
  description = "ID do security group do ALB"
  type        = string
}

variable "ecs_security_group_id" {
  description = "ID do security group das ECS tasks"
  type        = string
}

variable "clients_image" {
  description = "URL da imagem Docker para Clients API"
  type        = string
}

variable "transactions_image" {
  description = "URL da imagem Docker para Transactions API"
  type        = string
}

variable "database_url" {
  description = "URL de conexão do banco de dados"
  type        = string
  sensitive   = true
}

variable "redis_host" {
  description = "Host do Redis"
  type        = string
}

variable "redis_port" {
  description = "Porta do Redis"
  type        = number
}

variable "rabbitmq_url" {
  description = "URL de conexão do RabbitMQ"
  type        = string
  sensitive   = true
}

variable "clients_cpu" {
  description = "CPU para o serviço Clients"
  type        = string
}

variable "clients_memory" {
  description = "Memória para o serviço Clients"
  type        = string
}

variable "transactions_cpu" {
  description = "CPU para o serviço Transactions"
  type        = string
}

variable "transactions_memory" {
  description = "Memória para o serviço Transactions"
  type        = string
}

variable "clients_desired_count" {
  description = "Número desejado de tasks do serviço Clients"
  type        = number
}

variable "transactions_desired_count" {
  description = "Número desejado de tasks do serviço Transactions"
  type        = number
}

