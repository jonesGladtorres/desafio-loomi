#!/usr/bin/env node

/**
 * Gerador de CPFs válidos para testes
 * Uso: node scripts/generate-cpf.js [base]
 * Exemplo: node scripts/generate-cpf.js 123456789
 */

function generateValidCPF(base = '123456789') {
  if (base.length !== 9) {
    throw new Error('Base deve ter exatamente 9 dígitos');
  }

  // Calcula o primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(base.charAt(i)) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  const digito1 = resto === 10 || resto === 11 ? 0 : resto;

  // Calcula o segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(base.charAt(i)) * (11 - i);
  }
  soma += digito1 * 2;
  resto = 11 - (soma % 11);
  const digito2 = resto === 10 || resto === 11 ? 0 : resto;

  return base + digito1 + digito2;
}

function formatCPF(cpf) {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// Gerar CPF baseado no argumento ou usar padrão
const base = process.argv[2] || '123456789';

try {
  const cpfValido = generateValidCPF(base);
  const cpfFormatado = formatCPF(cpfValido);

  console.log('🎯 CPF Válido Gerado:');
  console.log(`   Sem formatação: ${cpfValido}`);
  console.log(`   Com formatação: ${cpfFormatado}`);
  console.log('');
  console.log('📋 Para usar na API:');
  console.log(`   "cpf": "${cpfFormatado}"`);

} catch (error) {
  console.error('❌ Erro:', error.message);
  console.log('');
  console.log('💡 Uso correto:');
  console.log('   node scripts/generate-cpf.js 123456789');
  console.log('   node scripts/generate-cpf.js 987654321');
}
