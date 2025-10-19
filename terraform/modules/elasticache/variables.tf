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

variable "redis_security_group_id" {
  description = "ID do security group do Redis"
  type        = string
}

variable "redis_node_type" {
  description = "Tipo de nó do Redis"
  type        = string
}

variable "redis_num_cache_nodes" {
  description = "Número de nós do Redis"
  type        = number
}

