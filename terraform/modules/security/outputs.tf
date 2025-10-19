output "alb_security_group_id" {
  description = "ID do security group do ALB"
  value       = aws_security_group.alb.id
}

output "ecs_security_group_id" {
  description = "ID do security group das ECS tasks"
  value       = aws_security_group.ecs_tasks.id
}

output "db_security_group_id" {
  description = "ID do security group do RDS"
  value       = aws_security_group.rds.id
}

output "redis_security_group_id" {
  description = "ID do security group do Redis"
  value       = aws_security_group.redis.id
}

output "mq_security_group_id" {
  description = "ID do security group do Amazon MQ"
  value       = aws_security_group.mq.id
}

