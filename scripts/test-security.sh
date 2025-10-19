#!/bin/bash

# Script para testar implementações de segurança

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }

BASE_URL="${1:-http://localhost:3001}"
API_KEY="${API_KEY:-loomi-dev-key-123}"

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║           🔒 TESTES DE SEGURANÇA - Loomi API                  ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
log_info "URL Base: ${BASE_URL}"
log_info "API Key: ${API_KEY}"
echo ""

# Teste 1: API Key Authentication
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_info "Teste 1: API Key Authentication"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Sem API Key
log_info "1.1 Testando sem API Key (deve retornar 401)..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/api/users")
if [ "$RESPONSE" == "401" ]; then
    log_success "Bloqueado corretamente: HTTP $RESPONSE"
else
    log_error "Falhou: HTTP $RESPONSE (esperado 401)"
fi

# Com API Key no header
log_info "1.2 Testando com X-API-Key header (deve retornar 200)..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -H "X-API-Key: ${API_KEY}" "${BASE_URL}/api/users")
if [ "$RESPONSE" == "200" ]; then
    log_success "Autenticado corretamente: HTTP $RESPONSE"
else
    log_error "Falhou: HTTP $RESPONSE (esperado 200)"
fi

# Com Bearer Token
log_info "1.3 Testando com Authorization Bearer (deve retornar 200)..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer ${API_KEY}" "${BASE_URL}/api/users")
if [ "$RESPONSE" == "200" ]; then
    log_success "Autenticado corretamente: HTTP $RESPONSE"
else
    log_error "Falhou: HTTP $RESPONSE (esperado 200)"
fi

echo ""

# Teste 2: Rate Limiting
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_info "Teste 2: Rate Limiting"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

log_info "Fazendo 15 requisições rápidas..."
RATE_LIMITED=false
for i in {1..15}; do
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -H "X-API-Key: ${API_KEY}" "${BASE_URL}/api/users")
    
    if [ "$RESPONSE" == "429" ]; then
        log_success "Rate limit ativado na requisição $i: HTTP $RESPONSE"
        RATE_LIMITED=true
        break
    fi
done

if [ "$RATE_LIMITED" = false ]; then
    log_warning "Rate limit não foi ativado nas 15 requisições"
fi

echo ""
log_info "Aguardando 60 segundos para rate limit resetar..."
sleep 60
echo ""

# Teste 3: XSS Protection
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_info "Teste 3: XSS Protection"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

log_info "Tentando injetar <script> tag..."
XSS_DATA='{"name":"<script>alert(\"xss\")</script>","email":"test@test.com","cpf":"12345678901"}'
RESPONSE=$(curl -s -X POST \
    -H "X-API-Key: ${API_KEY}" \
    -H "Content-Type: application/json" \
    -d "${XSS_DATA}" \
    "${BASE_URL}/api/users")

if echo "$RESPONSE" | grep -q "<script>"; then
    log_error "XSS não foi bloqueado!"
else
    log_success "XSS bloqueado/sanitizado corretamente"
fi

echo ""

# Teste 4: Headers de Segurança
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_info "Teste 4: Headers de Segurança"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

log_info "Verificando headers de segurança..."
HEADERS=$(curl -s -I -H "X-API-Key: ${API_KEY}" "${BASE_URL}/api/users")

check_header() {
    local header=$1
    if echo "$HEADERS" | grep -qi "$header"; then
        log_success "$header presente"
    else
        log_warning "$header ausente"
    fi
}

check_header "x-frame-options"
check_header "x-content-type-options"
check_header "strict-transport-security"
check_header "x-xss-protection"

echo ""

# Teste 5: CORS
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_info "Teste 5: CORS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

log_info "Testando CORS com origem permitida..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Origin: http://localhost:3000" \
    -H "X-API-Key: ${API_KEY}" \
    "${BASE_URL}/api/users")

if [ "$RESPONSE" == "200" ]; then
    log_success "CORS permitiu origem válida: HTTP $RESPONSE"
else
    log_warning "CORS bloqueou origem válida: HTTP $RESPONSE"
fi

echo ""

# Resumo
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                       📊 RESUMO                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
log_success "Testes de segurança concluídos!"
echo ""
echo "Para testes adicionais:"
echo "  → Swagger: ${BASE_URL}/api/docs/users"
echo "  → Health: ${BASE_URL}/api/users/health (sem API key)"
echo ""

