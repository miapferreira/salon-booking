#!/bin/bash

# 🏗️ Script para buildar imagem Docker apenas para EKS (AMD64)
# Mais simples e rápido para desenvolvimento
# Desenvolvido por: Michel Ferreira - SRE/DevOps Engineer

set -e

# Configurações
IMAGE_NAME="miapferreira/salon-booking"
VERSION=${1:-"latest"}
REGISTRY=${2:-"docker.io"}

echo "🏗️ Buildando imagem para EKS (AMD64)..."
echo "📦 Imagem: ${REGISTRY}/${IMAGE_NAME}:${VERSION}"

# Verificar se Docker está rodando
if ! docker info &> /dev/null; then
    echo "❌ Docker não está rodando"
    echo "💡 Inicie o Docker Desktop"
    exit 1
fi

# Verificar se está logado no registry
if ! docker info | grep -q "Username:"; then
    echo "⚠️  Você precisa estar logado no Docker Hub"
    echo "💡 Execute: docker login"
    exit 1
fi

# Buildar apenas para AMD64 (EKS)
echo "🔨 Buildando para linux/amd64 (EKS)..."
docker build \
  --platform linux/amd64 \
  -t ${REGISTRY}/${IMAGE_NAME}:${VERSION} \
  -t ${REGISTRY}/${IMAGE_NAME}:latest \
  .

# Fazer push para registry
echo "📤 Enviando para Docker Hub..."
docker push ${REGISTRY}/${IMAGE_NAME}:${VERSION}
docker push ${REGISTRY}/${IMAGE_NAME}:latest

if [ $? -eq 0 ]; then
    echo "✅ Imagem buildada e enviada com sucesso!"
    echo ""
    echo "📋 Imagem criada:"
    echo "  - ${REGISTRY}/${IMAGE_NAME}:${VERSION}"
    echo "  - ${REGISTRY}/${IMAGE_NAME}:latest"
    echo ""
    echo "🎯 Arquitetura: linux/amd64 (EKS)"
    echo ""
    echo "🔄 Agora reinicie os pods no EKS:"
    echo "  kubectl rollout restart deployment/salon-booking"
    echo ""
    echo "💡 Nota: Esta imagem roda no Mac via emulação (mais lenta)"
    echo "   Para desenvolvimento local, use: docker build --platform linux/arm64"
else
    echo "❌ Erro ao buildar imagem"
    exit 1
fi
