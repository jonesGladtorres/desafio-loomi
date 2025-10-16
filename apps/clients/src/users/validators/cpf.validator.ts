import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

/**
 * Validador customizado para CPF brasileiro
 */
@ValidatorConstraint({ name: 'isCPF', async: false })
export class IsCPFConstraint implements ValidatorConstraintInterface {
  validate(cpf: string, args: ValidationArguments) {
    if (!cpf) return true; // CPF é opcional

    // Remove caracteres não numéricos
    const cleanCPF = cpf.replace(/[^\d]/g, '');

    // CPF deve ter 11 dígitos
    if (cleanCPF.length !== 11) {
      return false;
    }

    // Verifica se todos os dígitos são iguais (ex: 111.111.111-11)
    if (/^(\d)\1{10}$/.test(cleanCPF)) {
      return false;
    }

    // Calcula o primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    let digito1 = resto === 10 || resto === 11 ? 0 : resto;

    if (digito1 !== parseInt(cleanCPF.charAt(9))) {
      return false;
    }

    // Calcula o segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    let digito2 = resto === 10 || resto === 11 ? 0 : resto;

    if (digito2 !== parseInt(cleanCPF.charAt(10))) {
      return false;
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return 'CPF inválido. Por favor, insira um CPF válido no formato XXX.XXX.XXX-XX ou apenas números.';
  }
}

/**
 * Decorator para validar CPF
 */
export function IsCPF(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsCPFConstraint,
    });
  };
}

/**
 * Formata CPF para o padrão XXX.XXX.XXX-XX
 */
export function formatCPF(cpf: string): string {
  if (!cpf) return cpf;
  
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  
  if (cleanCPF.length !== 11) {
    return cpf;
  }

  return cleanCPF.replace(
    /(\d{3})(\d{3})(\d{3})(\d{2})/,
    '$1.$2.$3-$4'
  );
}

/**
 * Remove formatação do CPF
 */
export function cleanCPF(cpf: string): string {
  if (!cpf) return cpf;
  return cpf.replace(/[^\d]/g, '');
}
