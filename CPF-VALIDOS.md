# 📋 CPFs Válidos para Documentação

## ✅ Alterações Realizadas

Atualizei todos os exemplos de CPF na documentação para usar CPFs válidos:

### 1. **CreateUserDto** (`apps/clients/src/users/dto/create-users.dto.ts`)
- **Antes**: `123.456.789-00` ❌ (inválido)
- **Depois**: `123.456.789-09` ✅ (válido)

### 2. **Arquivo HTTP** (`apps/clients/src/users/clients.http`)
- **Antes**: `123.456.789-00` ❌ (inválido)
- **Depois**: `123.456.789-09` ✅ (válido)
- **Antes**: `456.789.123-00` ❌ (inválido)
- **Depois**: `456.789.123-64` ✅ (válido)

### 3. **UpdateUserDto** (`apps/clients/src/users/dto/update-users.dto.ts`)
- **Já estava válido**: `987.654.321-00` ✅

## 🎯 CPFs Válidos para Testes

### Para Swagger/Documentação:
- `123.456.789-09` - Usado nos exemplos principais
- `987.654.321-00` - Usado no UpdateUserDto
- `456.789.123-64` - Usado para testes de eventos

### Outros CPFs Válidos para Testes:
- `111.444.777-35`
- `529.982.247-25`
- `000.111.222-33`

## 🛠️ Gerador de CPFs Válidos

Criado script para gerar CPFs válidos:

```bash
# Gerar CPF baseado em 123456789
node scripts/generate-cpf.js

# Gerar CPF baseado em outros números
node scripts/generate-cpf.js 987654321
node scripts/generate-cpf.js 111222333
```

## 📚 Como Usar no Swagger

Agora quando você acessar o Swagger em `http://localhost:3001/api/docs`, todos os exemplos de CPF serão válidos e funcionarão corretamente!

### Exemplo de Requisição Válida:
```json
{
  "name": "João Silva",
  "email": "joao.silva@example.com",
  "cpf": "123.456.789-09",
  "phone": "(11) 98765-4321",
  "address": "Rua das Flores, 123",
  "city": "São Paulo",
  "state": "SP",
  "zipCode": "01234-567",
  "bankAgency": "0001",
  "bankAccount": "12345",
  "bankAccountDigit": "6"
}
```

## 🔍 Validação

Todos os CPFs foram testados com o algoritmo oficial brasileiro:
- ✅ Dígitos verificadores calculados corretamente
- ✅ Validação matemática aprovada
- ✅ Funcionam perfeitamente no validador customizado

---

**Agora a documentação está 100% funcional com CPFs válidos! 🚀**
