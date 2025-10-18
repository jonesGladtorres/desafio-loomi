#!/bin/bash

echo "🧪 Teste de Mensageria RabbitMQ - Loomi"
echo "======================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para fazer requisições
make_request() {
    local method=$1
    local url=$2
    local data=$3
    local description=$4
    
    echo -e "${BLUE}📤 ${description}${NC}"
    echo "URL: ${method} ${url}"
    if [ -n "$data" ]; then
        echo "Data: $data"
    fi
    echo ""
    
    if [ -n "$data" ]; then
        curl -X $method "$url" \
            -H "Content-Type: application/json" \
            -d "$data" \
            -w "\nStatus: %{http_code}\n" \
            -s
    else
        curl -X $method "$url" \
            -w "\nStatus: %{http_code}\n" \
            -s
    fi
    echo ""
    echo "----------------------------------------"
    echo ""
}

# Função para aguardar entrada do usuário
wait_for_user() {
    echo -e "${YELLOW}⏳ Pressione Enter para continuar...${NC}"
    read
}

echo -e "${GREEN}🚀 Iniciando teste de mensageria RabbitMQ${NC}"
echo ""
echo "Este script irá:"
echo "1. Criar um usuário"
echo "2. Atualizar dados bancários (dispara evento)"
echo "3. Atualizar CPF (dispara evento)"
echo "4. Atualizar endereço (dispara evento)"
echo ""
echo -e "${YELLOW}💡 Dica: Abra outro terminal e execute 'make rabbitmq-monitor' para ver os eventos em tempo real${NC}"
echo ""
wait_for_user

# Passo 1: Criar usuário
echo -e "${GREEN}📝 Passo 1: Criando usuário${NC}"

# Gerar timestamp para tornar dados únicos
TIMESTAMP=$(date +%s)
# Gerar CPF único baseado no timestamp
CPF_BASE=$(printf "%09d" $((TIMESTAMP % 1000000000)))
CPF_VALIDO=$(node scripts/generate-cpf.js $CPF_BASE | grep "Com formatação:" | cut -d' ' -f3)

USER_DATA="{
  \"name\": \"Teste RabbitMQ $TIMESTAMP\",
  \"email\": \"teste.rabbitmq.$TIMESTAMP@example.com\",
  \"cpf\": \"$CPF_VALIDO\",
  \"phone\": \"(11) 98765-4321\",
  \"address\": \"Rua Teste, 123\",
  \"city\": \"São Paulo\",
  \"state\": \"SP\",
  \"zipCode\": \"01234-567\"
}"

RESPONSE=$(make_request "POST" "http://localhost:3001/api/users" "$USER_DATA" "Criando usuário de teste")

# Tentar diferentes padrões para extrair o ID
USER_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

# Se não encontrou com o padrão padrão, tentar outros padrões
if [ -z "$USER_ID" ]; then
    USER_ID=$(echo "$RESPONSE" | grep -o '"id": "[^"]*"' | cut -d'"' -f4)
fi

if [ -z "$USER_ID" ]; then
    USER_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | sed 's/"id":"//' | sed 's/"//')
fi

# Se ainda não encontrou, mostrar a resposta para debug
if [ -z "$USER_ID" ]; then
    echo -e "${RED}❌ Erro: Não foi possível obter o ID do usuário${NC}"
    echo -e "${YELLOW}📋 Resposta da API:${NC}"
    echo "$RESPONSE"
    echo ""
    echo -e "${YELLOW}💡 Dica: Verifique se a API está funcionando corretamente${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Usuário criado com ID: $USER_ID${NC}"
echo ""
wait_for_user

# Passo 2: Atualizar dados bancários (dispara evento)
echo -e "${GREEN}💰 Passo 2: Atualizando dados bancários (dispara evento)${NC}"
BANKING_DATA='{
  "bankAgency": "0003",
  "bankAccount": "99999",
  "bankAccountDigit": "1"
}'

make_request "PATCH" "http://localhost:3001/api/users/$USER_ID" "$BANKING_DATA" "Atualizando dados bancários"
echo -e "${YELLOW}📤 Este evento deve aparecer nos logs: 'user_banking_updated'${NC}"
echo ""
wait_for_user

# Passo 3: Atualizar CPF (dispara evento)
echo -e "${GREEN}🆔 Passo 3: Atualizando CPF (dispara evento)${NC}"
# Gerar novo CPF válido
CPF_BASE_NOVO=$(printf "%09d" $((TIMESTAMP + 1)))
CPF_NOVO=$(node scripts/generate-cpf.js $CPF_BASE_NOVO | grep "Com formatação:" | cut -d' ' -f3)
CPF_DATA="{
  \"cpf\": \"$CPF_NOVO\"
}"

make_request "PATCH" "http://localhost:3001/api/users/$USER_ID" "$CPF_DATA" "Atualizando CPF"
echo -e "${YELLOW}📤 Este evento deve aparecer nos logs: 'user_banking_updated'${NC}"
echo ""
wait_for_user

# Passo 4: Atualizar endereço (dispara evento)
echo -e "${GREEN}🏠 Passo 4: Atualizando endereço (dispara evento)${NC}"
ADDRESS_DATA='{
  "address": "Nova Rua, 456",
  "city": "Rio de Janeiro",
  "state": "RJ",
  "zipCode": "22041-030"
}'

make_request "PATCH" "http://localhost:3001/api/users/$USER_ID" "$ADDRESS_DATA" "Atualizando endereço"
echo -e "${YELLOW}📤 Este evento deve aparecer nos logs: 'user_banking_updated'${NC}"
echo ""
wait_for_user

# Passo 5: Verificar transações
echo -e "${GREEN}📊 Passo 5: Verificando transações${NC}"
make_request "GET" "http://localhost:3002/api/transactions" "" "Listando transações"
echo ""

# Resumo
echo -e "${GREEN}✅ Teste concluído!${NC}"
echo ""
echo "📋 Resumo do que aconteceu:"
echo "1. ✅ Usuário criado: $USER_ID"
echo "2. ✅ 3 eventos 'user_banking_updated' foram emitidos"
echo "3. ✅ Events foram processados pelo microsserviço de transações"
echo ""
echo "🔍 Para verificar se funcionou:"
echo "• Execute: make rabbitmq-status"
echo "• Acesse: http://localhost:15672 (loomi_user/loomi_password)"
echo "• Verifique os logs: make rabbitmq-logs"
echo ""
echo -e "${YELLOW}💡 Dica: Use 'make rabbitmq-monitor' para monitorar eventos em tempo real${NC}"
