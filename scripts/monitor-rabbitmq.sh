#!/bin/bash

echo "🐰 Monitoramento do RabbitMQ - Loomi"
echo "======================================"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para detectar ambiente (dev ou prod)
detect_environment() {
    if docker ps --format "table {{.Names}}" | grep -q "loomi-rabbitmq-dev"; then
        echo "dev"
    elif docker ps --format "table {{.Names}}" | grep -q "loomi-rabbitmq"; then
        echo "prod"
    else
        echo "none"
    fi
}

# Função para obter nomes dos containers baseado no ambiente
get_container_names() {
    local env=$1
    case $env in
        "dev")
            echo "loomi-rabbitmq-dev loomi-clients-app-dev loomi-transactions-app-dev"
            ;;
        "prod")
            echo "loomi-rabbitmq loomi-clients-app loomi-transactions-app"
            ;;
        *)
            echo ""
            ;;
    esac
}

# Função para verificar se o container está rodando
check_container() {
    local container_name=$1
    if docker ps --format "table {{.Names}}" | grep -q "^${container_name}$"; then
        echo -e "${GREEN}✅ ${container_name} está rodando${NC}"
        return 0
    else
        echo -e "${RED}❌ ${container_name} não está rodando${NC}"
        return 1
    fi
}

# Função para verificar status do RabbitMQ
check_rabbitmq_status() {
    local env=$1
    local rabbitmq_container=""
    
    case $env in
        "dev")
            rabbitmq_container="loomi-rabbitmq-dev"
            ;;
        "prod")
            rabbitmq_container="loomi-rabbitmq"
            ;;
        *)
            echo -e "${RED}❌ Ambiente não detectado${NC}"
            return 1
            ;;
    esac
    
    echo -e "${BLUE}📊 Status do RabbitMQ:${NC}"
    if docker exec $rabbitmq_container rabbitmq-diagnostics ping > /dev/null 2>&1; then
        echo -e "${GREEN}✅ RabbitMQ está saudável${NC}"
    else
        echo -e "${RED}❌ RabbitMQ não está respondendo${NC}"
        return 1
    fi
}

# Função para mostrar filas
show_queues() {
    local env=$1
    local rabbitmq_container=""
    
    case $env in
        "dev")
            rabbitmq_container="loomi-rabbitmq-dev"
            ;;
        "prod")
            rabbitmq_container="loomi-rabbitmq"
            ;;
        *)
            echo -e "${RED}❌ Ambiente não detectado${NC}"
            return 1
            ;;
    esac
    
    echo -e "${BLUE}📋 Filas do RabbitMQ:${NC}"
    docker exec $rabbitmq_container rabbitmqctl list_queues name messages consumers 2>/dev/null || echo "❌ Erro ao listar filas"
}

# Função para mostrar conexões
show_connections() {
    local env=$1
    local rabbitmq_container=""
    
    case $env in
        "dev")
            rabbitmq_container="loomi-rabbitmq-dev"
            ;;
        "prod")
            rabbitmq_container="loomi-rabbitmq"
            ;;
        *)
            echo -e "${RED}❌ Ambiente não detectado${NC}"
            return 1
            ;;
    esac
    
    echo -e "${BLUE}🔗 Conexões ativas:${NC}"
    docker exec $rabbitmq_container rabbitmqctl list_connections 2>/dev/null || echo "❌ Erro ao listar conexões"
}

# Função para mostrar logs recentes
show_recent_logs() {
    local env=$1
    local clients_container=""
    local transactions_container=""
    
    case $env in
        "dev")
            clients_container="loomi-clients-app-dev"
            transactions_container="loomi-transactions-app-dev"
            ;;
        "prod")
            clients_container="loomi-clients-app"
            transactions_container="loomi-transactions-app"
            ;;
        *)
            echo -e "${RED}❌ Ambiente não detectado${NC}"
            return 1
            ;;
    esac
    
    echo -e "${BLUE}📝 Logs recentes (últimas 10 linhas):${NC}"
    echo -e "${YELLOW}--- Clients App ---${NC}"
    docker logs $clients_container --tail 10 2>/dev/null | grep -E "(📤|Evento|rabbitmq|RabbitMQ)" || echo "Nenhum evento recente"
    
    echo -e "${YELLOW}--- Transactions App ---${NC}"
    docker logs $transactions_container --tail 10 2>/dev/null | grep -E "(📥|Evento|rabbitmq|RabbitMQ)" || echo "Nenhum evento recente"
}

# Função para testar conectividade
test_connectivity() {
    echo -e "${BLUE}🧪 Testando conectividade:${NC}"
    
    # Teste 1: Clients API
    if curl -s http://localhost:3001/api/users > /dev/null; then
        echo -e "${GREEN}✅ Clients API está respondendo${NC}"
    else
        echo -e "${RED}❌ Clients API não está respondendo${NC}"
    fi
    
    # Teste 2: Transactions API
    if curl -s http://localhost:3002/api/transactions > /dev/null; then
        echo -e "${GREEN}✅ Transactions API está respondendo${NC}"
    else
        echo -e "${RED}❌ Transactions API não está respondendo${NC}"
    fi
    
    # Teste 3: RabbitMQ Management
    if curl -s http://localhost:15672 > /dev/null; then
        echo -e "${GREEN}✅ RabbitMQ Management UI está acessível${NC}"
        echo -e "${YELLOW}   Acesse: http://localhost:15672${NC}"
        echo -e "${YELLOW}   Login: loomi_user / loomi_password${NC}"
    else
        echo -e "${RED}❌ RabbitMQ Management UI não está acessível${NC}"
    fi
}

# Função para monitorar em tempo real
monitor_realtime() {
    local env=$1
    local clients_container=""
    local transactions_container=""
    
    case $env in
        "dev")
            clients_container="loomi-clients-app-dev"
            transactions_container="loomi-transactions-app-dev"
            ;;
        "prod")
            clients_container="loomi-clients-app"
            transactions_container="loomi-transactions-app"
            ;;
        *)
            echo -e "${RED}❌ Ambiente não detectado${NC}"
            return 1
            ;;
    esac
    
    echo -e "${BLUE}🔄 Monitoramento em tempo real (Ctrl+C para sair):${NC}"
    echo -e "${YELLOW}Observando logs de eventos...${NC}"
    echo ""
    
    # Monitorar logs de ambos os containers
    docker logs -f $clients_container $transactions_container 2>&1 | grep -E "(📤|📥|Evento|rabbitmq|RabbitMQ|user_banking_updated)"
}

# Menu principal
ENVIRONMENT=$(detect_environment)

case "${1:-status}" in
    "status")
        echo "🔍 Verificando status geral..."
        echo -e "${BLUE}🌍 Ambiente detectado: ${ENVIRONMENT}${NC}"
        echo ""
        
        # Verificar containers baseado no ambiente
        if [ "$ENVIRONMENT" = "dev" ]; then
            check_container "loomi-rabbitmq-dev"
            check_container "loomi-clients-app-dev"
            check_container "loomi-transactions-app-dev"
        elif [ "$ENVIRONMENT" = "prod" ]; then
            check_container "loomi-rabbitmq"
            check_container "loomi-clients-app"
            check_container "loomi-transactions-app"
        else
            echo -e "${RED}❌ Nenhum ambiente detectado. Execute 'make dev-full' ou 'make docker-up' primeiro.${NC}"
            exit 1
        fi
        
        echo ""
        check_rabbitmq_status $ENVIRONMENT
        echo ""
        show_queues $ENVIRONMENT
        echo ""
        show_connections $ENVIRONMENT
        echo ""
        test_connectivity
        ;;
    
    "logs")
        show_recent_logs $ENVIRONMENT
        ;;
    
    "queues")
        show_queues $ENVIRONMENT
        ;;
    
    "connections")
        show_connections $ENVIRONMENT
        ;;
    
    "monitor")
        monitor_realtime $ENVIRONMENT
        ;;
    
    "test")
        test_connectivity
        ;;
    
    "help"|"-h"|"--help")
        echo "Uso: $0 [comando]"
        echo ""
        echo "Comandos disponíveis:"
        echo "  status     - Verificar status geral (padrão)"
        echo "  logs       - Mostrar logs recentes de eventos"
        echo "  queues     - Listar filas do RabbitMQ"
        echo "  connections- Listar conexões ativas"
        echo "  monitor    - Monitoramento em tempo real"
        echo "  test       - Testar conectividade das APIs"
        echo "  help       - Mostrar esta ajuda"
        echo ""
        echo "Exemplos:"
        echo "  $0 status"
        echo "  $0 monitor"
        echo "  $0 logs"
        ;;
    
    *)
        echo "Comando desconhecido: $1"
        echo "Use '$0 help' para ver os comandos disponíveis"
        exit 1
        ;;
esac
