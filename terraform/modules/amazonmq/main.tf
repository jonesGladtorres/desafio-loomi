# Amazon MQ (RabbitMQ)
resource "aws_mq_broker" "rabbitmq" {
  broker_name        = "loomi-${var.environment}-rabbitmq"
  engine_type        = "RabbitMQ"
  engine_version     = "3.13"
  host_instance_type = var.mq_instance_type
  # t3.micro only supports SINGLE_INSTANCE. For Multi-AZ, use mq.m5.large
  deployment_mode    = "SINGLE_INSTANCE"

  publicly_accessible = false
  subnet_ids          = [var.private_subnet_ids[0]]
  security_groups     = [var.mq_security_group_id]

  user {
    username = var.mq_username
    password = var.mq_password
  }

  # Logs
  logs {
    general = true
  }

  # Maintenance
  maintenance_window_start_time {
    day_of_week = "SUNDAY"
    time_of_day = "03:00"
    time_zone   = "UTC"
  }

  # Auto minor version upgrade
  auto_minor_version_upgrade = true

  tags = {
    Name = "loomi-${var.environment}-rabbitmq"
  }
}

