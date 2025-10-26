# 🏗️ Guia de Build para EKS (AMD64)

Este guia explica como resolver problemas de incompatibilidade de arquitetura entre Mac (ARM64) e EKS (AMD64).

## 🚨 Problema

- **Mac M1/M2**: Arquitetura ARM64 (Apple Silicon)
- **EKS/AWS**: Arquitetura AMD64 (Intel/AMD)
- **Resultado**: Imagem não roda no EKS

## ✅ Solução: Build AMD64

```bash
# Buildar apenas para AMD64 (EKS)
./build-simple.sh v1.0.0

# Ou com versão específica
./build-simple.sh latest
```

**Vantagens:**
- ✅ Funciona no EKS (nativo)
- ✅ Funciona no Mac (via emulação)
- ✅ Build mais rápido
- ✅ Menos complexidade
- ✅ Ideal para desenvolvimento e produção

## 🔧 Pré-requisitos

### 1. Docker Desktop

```bash
# Verificar se Docker está rodando
docker info

# Docker Desktop já inclui tudo que precisamos
```

### 2. Login no Docker Hub

```bash
# Fazer login no Docker Hub
docker login

# Verificar se está logado
docker info | grep "Username"
```

## 🚀 Como Usar

### Build e Deploy

```bash
# 1. Buildar imagem AMD64
./build-simple.sh v1.0.0

# 2. Deployar no EKS
kubectl rollout restart deployment/salon-booking
```

### Desenvolvimento Local

```bash
# Para testar localmente (mais lento via emulação)
docker run -p 3001:3001 miapferreira/salon-booking:latest

# Para desenvolvimento rápido (ARM64 nativo)
docker build --platform linux/arm64 -t salon-booking:dev .
docker run -p 3001:3001 salon-booking:dev
```

## 🔍 Verificações

### Verificar Arquitetura da Imagem

```bash
# Verificar arquitetura da imagem
docker inspect miapferreira/salon-booking:latest | grep Architecture

# Deve mostrar: "Architecture": "amd64"
```

### Verificar no EKS

```bash
# Verificar se o pod está rodando
kubectl get pods -l app=salon-booking

# Verificar logs
kubectl logs -l app=salon-booking

# Verificar eventos
kubectl get events --sort-by=.metadata.creationTimestamp
```

## 🐛 Troubleshooting

### Erro: "exec format error"

```bash
# Problema: Imagem ARM64 tentando rodar em AMD64
# Solução: Usar build AMD64
./build-simple.sh latest
```

### Erro: "not logged in"

```bash
# Fazer login no Docker Hub
docker login

# Verificar credenciais
docker info | grep "Username"
```

### Erro: "Docker daemon not running"

```bash
# Iniciar Docker Desktop
# Ou via terminal (se instalado via Homebrew)
brew services start docker
```

## 📊 Comparação de Métodos

| Método | Velocidade | Compatibilidade | Uso |
|--------|------------|-----------------|-----|
| AMD64 only | Rápida | EKS + Mac (emulação) | Recomendado |
| ARM64 only | Rápida | Apenas Mac | Desenvolvimento local |

## 🎯 Recomendação

- **Produção**: Use `./build-simple.sh v1.0.0` (AMD64)
- **Desenvolvimento local**: Use ARM64 nativo para velocidade
- **EKS**: Sempre AMD64

## 📝 Notas Importantes

1. **Primeira execução**: Pode demorar mais (download de base images)
2. **Cache**: Builds subsequentes são mais rápidos
3. **Registry**: Certifique-se de estar logado no Docker Hub
4. **Versões**: Use tags semânticas para produção
5. **Mac**: AMD64 roda via emulação (mais lento, mas funcional)
