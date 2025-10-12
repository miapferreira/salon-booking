#!/bin/bash

# Script para build e deploy do Salon Booking no Docker Hub
# Desenvolvido por: Michel Ferreira - SRE/DevOps Engineer

set -e  # Para o script se houver erro

# Variáveis
IMAGE_NAME="miapferreira/salon-booking"
VERSION="v1.0.0"
REGISTRY="docker.io"

echo "🚀 Iniciando build e deploy do Salon Booking..."
echo "📦 Imagem: $REGISTRY/$IMAGE_NAME"
echo "🏷️  Versão: $VERSION"
echo ""

# 1. Build da imagem
echo "🔨 Construindo imagem Docker..."
docker build -t $IMAGE_NAME:latest -t $IMAGE_NAME:$VERSION .

echo "✅ Build concluído!"
echo ""

# 2. Teste da imagem
echo "🧪 Testando imagem localmente..."
docker run -d -p 3000:3000 --name salon-test $IMAGE_NAME:latest

# Aguarda o container inicializar
echo "⏳ Aguardando inicialização..."
sleep 10

# Testa o health check
echo "🔍 Verificando health check..."
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Health check passou!"
else
    echo "❌ Health check falhou!"
    docker logs salon-test
    docker stop salon-test && docker rm salon-test
    exit 1
fi

# Para o container de teste
docker stop salon-test && docker rm salon-test
echo "🧹 Container de teste removido"
echo ""

# 3. Login no Docker Hub (se não estiver logado)
echo "🔐 Verificando login no Docker Hub..."
if ! docker info | grep -q "Username"; then
    echo "⚠️  Faça login no Docker Hub primeiro:"
    echo "   docker login"
    exit 1
fi

# 4. Push para Docker Hub
echo "📤 Fazendo push para Docker Hub..."
docker push $IMAGE_NAME:latest
docker push $IMAGE_NAME:$VERSION

echo ""
echo "🎉 Deploy concluído com sucesso!"
echo ""
echo "📋 Informações da imagem:"
echo "   🏷️  Latest: $REGISTRY/$IMAGE_NAME:latest"
echo "   🏷️  Version: $REGISTRY/$IMAGE_NAME:$VERSION"
echo ""
echo "🚀 Para usar no Kubernetes:"
echo "   image: $REGISTRY/$IMAGE_NAME:latest"
echo ""
echo "🔗 Docker Hub: https://hub.docker.com/r/miapferreira/salon-booking"
