import { IsEmail, IsOptional, IsString, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsCPF } from '../validators/cpf.validator';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Nome completo do usuário',
    example: 'João Silva Atualizado',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Email do usuário',
    example: 'joao.novo@example.com',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'CPF do usuário',
    example: '987.654.321-00',
  })
  @IsString()
  @IsOptional()
  @IsCPF()
  cpf?: string;

  @ApiPropertyOptional({
    description: 'Telefone do usuário',
    example: '(21) 91234-5678',
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Endereço do usuário',
    example: 'Avenida Paulista, 1000',
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({
    description: 'Cidade do usuário',
    example: 'Rio de Janeiro',
  })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({
    description: 'Estado do usuário (sigla)',
    example: 'RJ',
  })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({
    description: 'CEP do usuário',
    example: '22041-030',
  })
  @IsString()
  @IsOptional()
  @Matches(/^\d{5}-?\d{3}$/, {
    message: 'CEP deve estar no formato XXXXX-XXX ou XXXXXXXX',
  })
  zipCode?: string;

  @ApiPropertyOptional({
    description: 'Agência bancária',
    example: '0001',
  })
  @IsString()
  @IsOptional()
  @Matches(/^\d{4}(-\d)?$/, {
    message:
      'Agência deve conter 4 dígitos, opcionalmente com dígito verificador (XXXX ou XXXX-X)',
  })
  bankAgency?: string;

  @ApiPropertyOptional({
    description: 'Conta corrente',
    example: '12345',
  })
  @IsString()
  @IsOptional()
  @Matches(/^\d{5,10}$/, {
    message: 'Conta deve conter entre 5 e 10 dígitos',
  })
  bankAccount?: string;

  @ApiPropertyOptional({
    description: 'Dígito da conta corrente',
    example: '6',
  })
  @IsString()
  @IsOptional()
  bankAccountDigit?: string;
}
