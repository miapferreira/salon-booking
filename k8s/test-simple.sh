#!/bin/bash

# 🧪 Script para testar Salon Booking SEM nginx-ingress
# Desenvolvido por: Michel Ferreira - SRE/DevOps Engineer

set -e

echo "🧪 Configurando ambiente local SEM nginx-ingress..."

# Verificar se kubectl está instalado
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl não está instalado"
    echo "Instale com: brew install kubectl"
    exit 1
fi

echo "🚀 Aplicando manifestos da aplicação..."
kubectl apply -f kustomization.yaml

# Aplicar NodePort service
kubectl apply -f manifests/salon-booking-nodeport.yaml

echo "⏳ Aguardando aplicação ficar pronta..."
kubectl wait --for=condition=ready pod -l app=salon-booking --timeout=300s
kubectl wait --for=condition=ready pod -l app=postgres --timeout=300s

echo ""
echo "✅ Ambiente configurado SEM nginx-ingress!"
echo ""
echo "🔍 Status dos recursos:"
kubectl get pods
kubectl get svc

echo ""
echo "🌐 Para testar:"
echo "1. Via NodePort (porta 30080):"
echo "   curl http://localhost:30080"
echo "   http://localhost:30080"
echo ""
echo "2. Via Port Forward:"
echo "   kubectl port-forward service/salon-booking-service 8080:80"
echo "   curl http://localhost:8080"
echo "   http://localhost:8080"
echo ""
echo "3. Via NodePort Service:"
echo "   kubectl get svc salon-booking-nodeport"
echo "   # Use o NODE-IP:30080"

echo ""
echo "🧹 Para limpar:"
echo "   kubectl delete -f kustomization.yaml"
echo "   kubectl delete -f manifests/salon-booking-nodeport.yaml"
