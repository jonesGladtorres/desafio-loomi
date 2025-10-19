variable "environment" {
  description = "Ambiente"
  type        = string
}

variable "vpc_id" {
  description = "ID da VPC"
  type        = string
}

variable "private_subnet_ids" {
  description = "IDs das subnets privadas"
  type        = list(string)
}

variable "mq_security_group_id" {
  description = "ID do security group do Amazon MQ"
  type        = string
}

variable "mq_username" {
  description = "Username do RabbitMQ"
  type        = string
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
}

