import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  IsIn,
  IsPositive,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty({
    description: 'Valor da transação (positivo, máximo 2 casas decimais)',
    example: 150.5,
    minimum: 0.01,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    description: 'Tipo de transação',
    enum: ['credit', 'debit', 'transfer'],
    example: 'credit',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['credit', 'debit', 'transfer'], {
    message: 'type must be one of: credit, debit, transfer',
  })
  type: string;

  @ApiProperty({
    description: 'Descrição da transação (opcional)',
    example: 'Pagamento recebido',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Status da transação',
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    example: 'completed',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['pending', 'completed', 'failed', 'cancelled'], {
    message: 'status must be one of: pending, completed, failed, cancelled',
  })
  status: string;

  @ApiProperty({
    description: 'UUID do usuário (deve existir no banco)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'userId must be a valid UUID' })
  @IsNotEmpty()
  userId: string;
}
