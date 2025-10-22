#!/bin/bash

# 🚀 Script para testar HPA com RPS
# Desenvolvido por: Michel Ferreira - SRE/DevOps Engineer

set -e

echo "🚀 Testando HPA com RPS..."

# Verificar se kubectl está instalado
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl não está instalado"
    exit 1
fi

# Verificar se curl está instalado
if ! command -v curl &> /dev/null; then
    echo "❌ curl não está instalado"
    exit 1
fi

echo "📊 Status inicial do HPA:"
kubectl get hpa salon-booking-hpa

echo ""
echo "🔍 Status dos pods:"
kubectl get pods -l app=salon-booking

echo ""
echo "📈 Iniciando teste de carga..."

# Função para gerar carga
generate_load() {
    local duration=$1
    local rate=$2
    
    echo "🔥 Gerando carga: $rate req/s por $duration segundos"
    
    for i in $(seq 1 $duration); do
        for j in $(seq 1 $rate); do
            curl -s http://localhost:3001/api/health > /dev/null &
        done
        sleep 1
        echo "Segundo $i/$duration - $rate requisições enviadas"
    done
    
    # Aguardar todas as requisições terminarem
    wait
}

# Monitorar HPA em background
monitor_hpa() {
    while true; do
        echo "📊 $(date): $(kubectl get hpa salon-booking-hpa -o jsonpath='{.status.currentReplicas}') pods ativos"
        sleep 10
    done
}

# Iniciar monitoramento em background
monitor_hpa &
MONITOR_PID=$!

echo ""
echo "🎯 Cenários de teste:"
echo "1. Carga baixa (5 req/s por 30s)"
echo "2. Carga média (20 req/s por 60s)" 
echo "3. Carga alta (50 req/s por 120s)"
echo "4. Carga extrema (100 req/s por 60s)"

# Teste 1: Carga baixa
echo ""
echo "🧪 Teste 1: Carga baixa (5 req/s)"
generate_load 30 5

# Aguardar estabilização
echo "⏳ Aguardando estabilização..."
sleep 30

# Teste 2: Carga média
echo ""
echo "🧪 Teste 2: Carga média (20 req/s)"
generate_load 60 20

# Aguardar estabilização
echo "⏳ Aguardando estabilização..."
sleep 30

# Teste 3: Carga alta
echo ""
echo "🧪 Teste 3: Carga alta (50 req/s)"
generate_load 120 50

# Aguardar estabilização
echo "⏳ Aguardando estabilização..."
sleep 60

# Teste 4: Carga extrema
echo ""
echo "🧪 Teste 4: Carga extrema (100 req/s)"
generate_load 60 100

# Parar monitoramento
kill $MONITOR_PID 2>/dev/null || true

echo ""
echo "📊 Status final do HPA:"
kubectl get hpa salon-booking-hpa

echo ""
echo "📈 Histórico de eventos do HPA:"
kubectl describe hpa salon-booking-hpa

echo ""
echo "🔍 Status final dos pods:"
kubectl get pods -l app=salon-booking

echo ""
echo "✅ Teste de HPA concluído!"
echo ""
echo "📋 Para monitorar em tempo real:"
echo "   kubectl get hpa salon-booking-hpa -w"
echo ""
echo "📊 Para ver métricas detalhadas:"
echo "   kubectl top pods -l app=salon-booking"
