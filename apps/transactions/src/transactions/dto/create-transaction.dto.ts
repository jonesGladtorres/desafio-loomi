import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  IsIn,
  IsPositive,
} from 'class-validator';

export class CreateTransactionDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  @IsIn(['credit', 'debit', 'transfer'], {
    message: 'type must be one of: credit, debit, transfer',
  })
  type: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['pending', 'completed', 'failed', 'cancelled'], {
    message: 'status must be one of: pending, completed, failed, cancelled',
  })
  status: string;

  @IsUUID('4', { message: 'userId must be a valid UUID' })
  @IsNotEmpty()
  userId: string;
}
