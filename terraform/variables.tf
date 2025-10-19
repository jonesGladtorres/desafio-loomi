variable "aws_region" {
  description = "Região AWS"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Ambiente (dev, staging, production)"
  type        = string
  default     = "production"
}

variable "vpc_cidr" {
  description = "CIDR block para VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Zonas de disponibilidade"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

# Database
variable "db_name" {
  description = "Nome do banco de dados"
  type        = string
  default     = "loomi_db"
}

variable "db_username" {
  description = "Username do banco de dados"
  type        = string
  default     = "loomi_user"
  sensitive   = true
}

variable "db_password" {
  description = "Password do banco de dados"
  type        = string
  sensitive   = true
}

variable "db_instance_class" {
  description = "Classe da instância RDS"
  type        = string
  default     = "db.t3.micro" # Free tier eligible
}

variable "db_allocated_storage" {
  description = "Storage alocado em GB"
  type        = number
  default     = 20
}

# Redis
variable "redis_node_type" {
  description = "Tipo de nó do Redis"
  type        = string
  default     = "cache.t3.micro" # Free tier eligible
}

variable "redis_num_cache_nodes" {
  description = "Número de nós do Redis"
  type        = number
  default     = 1
}

# Amazon MQ
variable "mq_username" {
  description = "Username do RabbitMQ"
  type        = string
  default     = "loomi_user"
  sensitive   = true
}

variable "mq_password" {
  description = "Password do RabbitMQ"
  type        = string
  sensitive   = true
}

variable "mq_instance_type" {
  description = "Tipo de instância do Amazon MQ"
  type        = string
  default     = "mq.t3.micro" # Menor instância disponível
}

# ECS Tasks
variable "clients_cpu" {
  description = "CPU para o serviço Clients (em unidades de CPU)"
  type        = string
  default     = "256" # 0.25 vCPU
}

variable "clients_memory" {
  description = "Memória para o serviço Clients (em MB)"
  type        = string
  default     = "512" # 512 MB
}

variable "transactions_cpu" {
  description = "CPU para o serviço Transactions"
  type        = string
  default     = "256"
}

variable "transactions_memory" {
  description = "Memória para o serviço Transactions"
  type        = string
  default     = "512"
}

variable "clients_desired_count" {
  description = "Número desejado de tasks do serviço Clients"
  type        = number
  default     = 2
}

variable "transactions_desired_count" {
  description = "Número desejado de tasks do serviço Transactions"
  type        = number
  default     = 2
}

