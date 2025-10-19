# ECR Repository para Clients API
resource "aws_ecr_repository" "clients" {
  name                 = "loomi-${var.environment}-clients"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = {
    Name = "loomi-${var.environment}-clients"
  }
}

# ECR Repository para Transactions API
resource "aws_ecr_repository" "transactions" {
  name                 = "loomi-${var.environment}-transactions"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = {
    Name = "loomi-${var.environment}-transactions"
  }
}

# Lifecycle Policy para limpar imagens antigas
resource "aws_ecr_lifecycle_policy" "clients" {
  repository = aws_ecr_repository.clients.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 10 images"
        selection = {
          tagStatus     = "any"
          countType     = "imageCountMoreThan"
          countNumber   = 10
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

resource "aws_ecr_lifecycle_policy" "transactions" {
  repository = aws_ecr_repository.transactions.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 10 images"
        selection = {
          tagStatus     = "any"
          countType     = "imageCountMoreThan"
          countNumber   = 10
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

