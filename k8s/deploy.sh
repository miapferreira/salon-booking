#!/bin/bash

# 🚀 Script de Deploy do Salon Booking no EKS
# Desenvolvido por: Michel Ferreira - SRE/DevOps Engineer
# Email: mi.apferreira@gmail.com
# GitHub: https://github.com/miapferreira

set -e  # Para o script se houver erro

echo "🚀 Iniciando deploy do Salon Booking no EKS..."

# Verificar se kubectl está configurado
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ kubectl não está configurado ou cluster não está acessível"
    echo "Execute: aws eks --region us-east-1 update-kubeconfig --name eks-cluster"
    exit 1
fi

echo "✅ kubectl configurado e cluster acessível"

# Verificar contexto atual
CURRENT_CONTEXT=$(kubectl config current-context)
echo "📍 Contexto atual: $CURRENT_CONTEXT"

# Perguntar se deseja continuar
read -p "Deseja continuar com o deploy? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deploy cancelado"
    exit 1
fi

echo "🔧 Deploy iniciado..."

# 1. Instalar nginx-ingress-controller se não estiver instalado
echo "📦 Verificando nginx-ingress-controller..."
if ! kubectl get namespace ingress-nginx &> /dev/null; then
    echo "🔧 Instalando nginx-ingress-controller..."
    kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/aws/deploy.yaml
    
    echo "⏳ Aguardando nginx-ingress-controller ficar pronto..."
    kubectl wait --namespace ingress-nginx \
        --for=condition=ready pod \
        --selector=app.kubernetes.io/component=controller \
        --timeout=300s
else
    echo "✅ nginx-ingress-controller já está instalado"
fi

# 2. Instalar cert-manager se não estiver instalado
echo "📦 Verificando cert-manager..."
if ! kubectl get namespace cert-manager &> /dev/null; then
    echo "🔧 Instalando cert-manager..."
    kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.18.2/cert-manager.yaml
    
    echo "⏳ Aguardando cert-manager ficar pronto..."
    kubectl wait --namespace cert-manager \
        --for=condition=ready pod \
        --selector=app.kubernetes.io/component=controller \
        --timeout=300s
else
    echo "✅ cert-manager já está instalado"
fi

# 3. Aplicar ClusterIssuers
echo "🔐 Configurando ClusterIssuers..."
kubectl apply -f cert/production-issuer.yaml
kubectl apply -f cert/staging-issuer.yaml

# 4. Aplicar manifestos da aplicação
echo "🚀 Aplicando manifestos da aplicação..."

# Aplicar ConfigMap e Secrets
kubectl apply -f manifests/salon-booking-configmap.yaml
kubectl apply -f manifests/salon-booking-secrets.yaml

# Aplicar PostgreSQL
kubectl apply -f manifests/postgres-pvc.yaml
kubectl apply -f manifests/postgres-deployment.yaml
kubectl apply -f manifests/postgres-service.yaml

# Aguardar PostgreSQL ficar pronto
echo "⏳ Aguardando PostgreSQL ficar pronto..."
kubectl wait --for=condition=ready pod -l app=postgres --timeout=300s

# Aplicar aplicação principal
kubectl apply -f manifests/salon-booking-deployment.yaml
kubectl apply -f manifests/salon-booking-service.yaml

# Aguardar aplicação ficar pronto
echo "⏳ Aguardando Salon Booking ficar pronto..."
kubectl wait --for=condition=ready pod -l app=salon-booking --timeout=300s

# Aplicar Ingress
kubectl apply -f manifests/salon-booking-ingress.yaml

# 5. Verificar status
echo "🔍 Verificando status do deploy..."

echo ""
echo "📊 Status dos Pods:"
kubectl get pods -o wide

echo ""
echo "📊 Status dos Services:"
kubectl get svc

echo ""
echo "📊 Status do Ingress:"
kubectl get ingress

echo ""
echo "📊 Status dos Certificados:"
kubectl get certificate

# 6. Obter informações de acesso
echo ""
echo "🌐 Informações de Acesso:"

# Obter hostname do Load Balancer
LB_HOSTNAME=$(kubectl get svc -n ingress-nginx ingress-nginx-controller -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "N/A")

if [ "$LB_HOSTNAME" != "N/A" ] && [ ! -z "$LB_HOSTNAME" ]; then
    echo "🔗 Load Balancer: $LB_HOSTNAME"
    echo ""
    echo "📝 Para testar a aplicação:"
    echo "   curl -H 'Host: salon-booking.mafinfo.com.br' http://$LB_HOSTNAME"
    echo ""
    echo "📝 Para configurar DNS:"
    echo "   CNAME salon-booking.mafinfo.com.br → $LB_HOSTNAME"
else
    echo "⚠️  Load Balancer ainda não está disponível"
    echo "   Execute: kubectl get svc -n ingress-nginx ingress-nginx-controller"
fi

echo ""
echo "✅ Deploy concluído com sucesso!"
echo ""
echo "🔍 Comandos úteis para monitoramento:"
echo "   kubectl get pods"
echo "   kubectl get svc"
echo "   kubectl get ingress"
echo "   kubectl get certificate"
echo "   kubectl logs -l app=salon-booking"
echo "   kubectl logs -n ingress-nginx deployment/ingress-nginx-controller"
