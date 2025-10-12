#!/bin/bash

# 🏗️ Script para buildar imagem Docker multi-arquitetura
# Necessário para EKS (AMD64) quando desenvolvendo em Mac M1/M2 (ARM64)
# Desenvolvido por: Michel Ferreira - SRE/DevOps Engineer

set -e

echo "🏗️ Buildando imagem para EKS (AMD64)..."

# Verificar se buildx está disponível
if ! docker buildx version &> /dev/null; then
    echo "❌ docker buildx não está disponível"
    echo "Instale com: brew install docker-buildx"
    exit 1
fi

# Criar builder se não existir
if ! docker buildx inspect multiarch &> /dev/null; then
    echo "📦 Criando builder multi-arquitetura..."
    docker buildx create --name multiarch --use
fi

# Usar o builder
docker buildx use multiarch

# Buildar para AMD64 e ARM64
echo "🔨 Buildando para linux/amd64 e linux/arm64..."
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t miapferreira/salon-booking:latest \
  -t miapferreira/salon-booking:v1.0.0 \
  --push \
  .

if [ $? -eq 0 ]; then
    echo "✅ Imagem buildada e enviada para Docker Hub com sucesso!"
    echo ""
    echo "📋 Imagens criadas:"
    echo "  - miapferreira/salon-booking:latest"
    echo "  - miapferreira/salon-booking:v1.0.0"
    echo ""
    echo "🎯 Arquiteturas suportadas:"
    echo "  - linux/amd64 (EKS, AWS, servidores Intel/AMD)"
    echo "  - linux/arm64 (Mac M1/M2, AWS Graviton)"
    echo ""
    echo "🔄 Agora reinicie os pods no EKS:"
    echo "  kubectl rollout restart deployment/salon-booking"
else
    echo "❌ Erro ao buildar imagem"
    exit 1
fi
