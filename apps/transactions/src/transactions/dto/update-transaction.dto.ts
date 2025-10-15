import {
  IsNumber,
  IsOptional,
  IsString,
  IsIn,
  IsPositive,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTransactionDto {
  @ApiPropertyOptional({
    description: 'Valor da transação',
    example: 200.0,
    minimum: 0.01,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @IsOptional()
  amount?: number;

  @ApiPropertyOptional({
    description: 'Tipo de transação',
    enum: ['credit', 'debit', 'transfer'],
    example: 'debit',
  })
  @IsString()
  @IsIn(['credit', 'debit', 'transfer'])
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({
    description: 'Descrição da transação',
    example: 'Compra online',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Status da transação',
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    example: 'cancelled',
  })
  @IsString()
  @IsIn(['pending', 'completed', 'failed', 'cancelled'])
  @IsOptional()
  status?: string;
}
