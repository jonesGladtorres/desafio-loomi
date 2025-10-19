# Security Group para Application Load Balancer
resource "aws_security_group" "alb" {
  name        = "loomi-${var.environment}-alb-sg"
  description = "Security group para Application Load Balancer"
  vpc_id      = var.vpc_id

  ingress {
    description = "HTTP de qualquer lugar"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS de qualquer lugar"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "loomi-${var.environment}-alb-sg"
  }
}

# Security Group para ECS Tasks
resource "aws_security_group" "ecs_tasks" {
  name        = "loomi-${var.environment}-ecs-tasks-sg"
  description = "Security group para ECS tasks"
  vpc_id      = var.vpc_id

  ingress {
    description     = "Traffic from ALB"
    from_port       = 0
    to_port         = 65535
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    description = "Outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "loomi-${var.environment}-ecs-tasks-sg"
  }
}

# Security Group para RDS PostgreSQL
resource "aws_security_group" "rds" {
  name        = "loomi-${var.environment}-rds-sg"
  description = "Security group para RDS PostgreSQL"
  vpc_id      = var.vpc_id

  ingress {
    description     = "PostgreSQL from ECS tasks"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id]
  }

  egress {
    description = "Outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "loomi-${var.environment}-rds-sg"
  }
}

# Security Group para ElastiCache Redis
resource "aws_security_group" "redis" {
  name        = "loomi-${var.environment}-redis-sg"
  description = "Security group para ElastiCache Redis"
  vpc_id      = var.vpc_id

  ingress {
    description     = "Redis from ECS tasks"
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id]
  }

  egress {
    description = "Outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "loomi-${var.environment}-redis-sg"
  }
}

# Security Group para Amazon MQ (RabbitMQ)
resource "aws_security_group" "mq" {
  name        = "loomi-${var.environment}-mq-sg"
  description = "Security group para Amazon MQ"
  vpc_id      = var.vpc_id

  ingress {
    description     = "AMQP from ECS tasks"
    from_port       = 5671
    to_port         = 5672
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id]
  }

  ingress {
    description     = "RabbitMQ Management from ECS tasks"
    from_port       = 15671
    to_port         = 15672
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id]
  }

  egress {
    description = "Outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "loomi-${var.environment}-mq-sg"
  }
}

