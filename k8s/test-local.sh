#!/bin/bash

# 🧪 Script para testar Salon Booking localmente com Kind
# Desenvolvido por: Michel Ferreira - SRE/DevOps Engineer

set -e

echo "🧪 Configurando ambiente local com Kind..."

# Verificar se Kind está instalado
if ! command -v kind &> /dev/null; then
    echo "❌ Kind não está instalado"
    echo "Instale com: brew install kind"
    exit 1
fi

# Criar configuração do cluster Kind
cat > kind-config.yaml << EOF
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
name: salon-booking-test
nodes:
- role: control-plane
  extraPortMappings:
  - containerPort: 80
    hostPort: 80
    protocol: TCP
  - containerPort: 443
    hostPort: 443
    protocol: TCP
- role: worker
- role: worker
EOF

echo "🏗️ Criando cluster Kind..."
kind create cluster --config kind-config.yaml

echo "📦 Instalando nginx-ingress-controller..."
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml

echo "⏳ Aguardando nginx-ingress-controller..."
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=300s

echo "🔐 Instalando cert-manager..."
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.18.2/cert-manager.yaml

echo "⏳ Aguardando cert-manager..."
kubectl wait --namespace cert-manager \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=300s

echo "🚀 Aplicando manifestos da aplicação..."
kubectl apply -f kustomization.yaml

echo "⏳ Aguardando aplicação ficar pronta..."
kubectl wait --for=condition=ready pod -l app=salon-booking --timeout=300s
kubectl wait --for=condition=ready pod -l app=postgres --timeout=300s

echo ""
echo "✅ Ambiente local configurado!"
echo ""
echo "🔍 Status dos recursos:"
kubectl get pods
kubectl get svc
kubectl get ingress

echo ""
echo "🌐 Para testar localmente:"
echo "1. Adicione ao /etc/hosts:"
echo "   127.0.0.1 salon-booking.local"
echo ""
echo "2. Teste a aplicação:"
echo "   curl http://salon-booking.local"
echo ""
echo "3. Acesse no navegador:"
echo "   http://salon-booking.local"

echo ""
echo "🧹 Para limpar:"
echo "   kind delete cluster --name salon-booking-test"

# Limpar arquivo temporário
rm -f kind-config.yaml
