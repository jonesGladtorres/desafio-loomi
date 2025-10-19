variable "environment" {
  description = "Ambiente"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block para VPC"
  type        = string
}

variable "availability_zones" {
  description = "Zonas de disponibilidade"
  type        = list(string)
}

