import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsCPF } from '../validators/cpf.validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'João Silva',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Email do usuário (único)',
    example: 'joao.silva@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'CPF do usuário (único, opcional)',
    example: '123.456.789-09',
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsCPF()
  cpf?: string;

  @ApiProperty({
    description: 'Telefone do usuário',
    example: '(11) 98765-4321',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Matches(/^\(?\d{2}\)?\s?\d{4,5}[-\s]?\d{4}$/, {
    message: 'Telefone deve estar no formato (XX) XXXXX-XXXX ou (XX) XXXX-XXXX',
  })
  phone?: string;

  @ApiProperty({
    description: 'Endereço do usuário',
    example: 'Rua das Flores, 123',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: 'Cidade do usuário',
    example: 'São Paulo',
    required: false,
  })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({
    description: 'Estado do usuário (sigla)',
    example: 'SP',
    required: false,
  })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiProperty({
    description: 'CEP do usuário',
    example: '01234-567',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Matches(/^\d{5}-?\d{3}$/, {
    message: 'CEP deve estar no formato XXXXX-XXX ou XXXXXXXX',
  })
  zipCode?: string;

  @ApiProperty({
    description: 'Agência bancária',
    example: '0001',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Matches(/^\d{4}(-\d)?$/, {
    message:
      'Agência deve conter 4 dígitos, opcionalmente com dígito verificador (XXXX ou XXXX-X)',
  })
  bankAgency?: string;

  @ApiProperty({
    description: 'Conta corrente',
    example: '12345',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Matches(/^\d{5,10}$/, {
    message: 'Conta deve conter entre 5 e 10 dígitos',
  })
  bankAccount?: string;

  @ApiProperty({
    description: 'Dígito da conta corrente',
    example: '6',
    required: false,
  })
  @IsString()
  @IsOptional()
  bankAccountDigit?: string;
}
