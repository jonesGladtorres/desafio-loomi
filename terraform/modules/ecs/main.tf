# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "loomi-${var.environment}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name = "loomi-${var.environment}-cluster"
  }
}

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "loomi-${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.alb_security_group_id]
  subnets            = var.public_subnet_ids

  enable_deletion_protection = var.environment == "production"

  tags = {
    Name = "loomi-${var.environment}-alb"
  }
}

# Target Group para Clients API
resource "aws_lb_target_group" "clients" {
  name        = "loomi-${var.environment}-clients-tg"
  port        = 3001
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    path                = "/api/users/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    matcher             = "200-299"
  }

  deregistration_delay = 30

  tags = {
    Name = "loomi-${var.environment}-clients-tg"
  }
}

# Target Group para Transactions API
resource "aws_lb_target_group" "transactions" {
  name        = "loomi-${var.environment}-transactions-tg"
  port        = 3002
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    path                = "/api/transactions/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    matcher             = "200-299"
  }

  deregistration_delay = 30

  tags = {
    Name = "loomi-${var.environment}-transactions-tg"
  }
}

# ALB Listener (HTTP)
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "fixed-response"

    fixed_response {
      content_type = "text/plain"
      message_body = "Not Found"
      status_code  = "404"
    }
  }
}

# Listener Rule para Clients API
resource "aws_lb_listener_rule" "clients" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.clients.arn
  }

  condition {
    path_pattern {
      values = ["/api/users*"]
    }
  }
}

# Listener Rule para Users Swagger
resource "aws_lb_listener_rule" "users_docs" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 101

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.clients.arn
  }

  condition {
    path_pattern {
      values = ["/api/docs/users*"]
    }
  }
}

# Listener Rule para Transactions API
resource "aws_lb_listener_rule" "transactions" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 200

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.transactions.arn
  }

  condition {
    path_pattern {
      values = ["/api/transactions*"]
    }
  }
}

# Listener Rule para Transactions Swagger
resource "aws_lb_listener_rule" "transactions_docs" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 201

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.transactions.arn
  }

  condition {
    path_pattern {
      values = ["/api/docs/transactions*"]
    }
  }
}

# IAM Role para ECS Task Execution
resource "aws_iam_role" "ecs_task_execution_role" {
  name = "loomi-${var.environment}-ecs-task-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "loomi-${var.environment}-ecs-task-execution-role"
  }
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# IAM Role para ECS Task
resource "aws_iam_role" "ecs_task_role" {
  name = "loomi-${var.environment}-ecs-task-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "loomi-${var.environment}-ecs-task-role"
  }
}

# Task Definition para Clients API
resource "aws_ecs_task_definition" "clients" {
  family                   = "loomi-${var.environment}-clients"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.clients_cpu
  memory                   = var.clients_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name      = "clients"
      image     = var.clients_image
      essential = true

      portMappings = [
        {
          containerPort = 3001
          protocol      = "tcp"
        }
      ]

      environment = [
        {
          name  = "NODE_ENV"
          value = "production"
        },
        {
          name  = "DATABASE_URL"
          value = var.database_url
        },
        {
          name  = "REDIS_HOST"
          value = var.redis_host
        },
        {
          name  = "REDIS_PORT"
          value = tostring(var.redis_port)
        },
        {
          name  = "RABBITMQ_URL"
          value = var.rabbitmq_url
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/loomi-${var.environment}-clients"
          "awslogs-region"        = data.aws_region.current.name
          "awslogs-stream-prefix" = "ecs"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "wget --quiet --tries=1 --spider http://localhost:3001/api/users || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }
    }
  ])

  tags = {
    Name = "loomi-${var.environment}-clients"
  }
}

# Task Definition para Transactions API
resource "aws_ecs_task_definition" "transactions" {
  family                   = "loomi-${var.environment}-transactions"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.transactions_cpu
  memory                   = var.transactions_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name      = "transactions"
      image     = var.transactions_image
      essential = true

      portMappings = [
        {
          containerPort = 3002
          protocol      = "tcp"
        }
      ]

      environment = [
        {
          name  = "NODE_ENV"
          value = "production"
        },
        {
          name  = "DATABASE_URL"
          value = var.database_url
        },
        {
          name  = "REDIS_HOST"
          value = var.redis_host
        },
        {
          name  = "REDIS_PORT"
          value = tostring(var.redis_port)
        },
        {
          name  = "RABBITMQ_URL"
          value = var.rabbitmq_url
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/loomi-${var.environment}-transactions"
          "awslogs-region"        = data.aws_region.current.name
          "awslogs-stream-prefix" = "ecs"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "wget --quiet --tries=1 --spider http://localhost:3002/api/transactions || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }
    }
  ])

  tags = {
    Name = "loomi-${var.environment}-transactions"
  }
}

# ECS Service para Clients API
resource "aws_ecs_service" "clients" {
  name            = "loomi-${var.environment}-clients-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.clients.arn
  desired_count   = var.clients_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [var.ecs_security_group_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.clients.arn
    container_name   = "clients"
    container_port   = 3001
  }

  depends_on = [aws_lb_listener.http]

  tags = {
    Name = "loomi-${var.environment}-clients-service"
  }
}

# ECS Service para Transactions API
resource "aws_ecs_service" "transactions" {
  name            = "loomi-${var.environment}-transactions-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.transactions.arn
  desired_count   = var.transactions_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [var.ecs_security_group_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.transactions.arn
    container_name   = "transactions"
    container_port   = 3002
  }

  depends_on = [aws_lb_listener.http]

  tags = {
    Name = "loomi-${var.environment}-transactions-service"
  }
}

# Auto Scaling para Clients Service
resource "aws_appautoscaling_target" "clients" {
  max_capacity       = 10
  min_capacity       = var.clients_desired_count
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.clients.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "clients_cpu" {
  name               = "loomi-${var.environment}-clients-cpu-autoscaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.clients.resource_id
  scalable_dimension = aws_appautoscaling_target.clients.scalable_dimension
  service_namespace  = aws_appautoscaling_target.clients.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value = 70.0
  }
}

# Auto Scaling para Transactions Service
resource "aws_appautoscaling_target" "transactions" {
  max_capacity       = 10
  min_capacity       = var.transactions_desired_count
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.transactions.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "transactions_cpu" {
  name               = "loomi-${var.environment}-transactions-cpu-autoscaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.transactions.resource_id
  scalable_dimension = aws_appautoscaling_target.transactions.scalable_dimension
  service_namespace  = aws_appautoscaling_target.transactions.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value = 70.0
  }
}

# Data source para região atual
data "aws_region" "current" {}

