# 🚀 Salon Booking - Deploy no Amazon EKS

Sistema completo de agendamento deployado como **microserviço** no Amazon EKS usando nginx-ingress e cert-manager.

**Desenvolvido por:** Michel Ferreira - SRE/DevOps Engineer  
**Email:** mi.apferreira@gmail.com  
**GitHub:** [@miapferreira](https://github.com/miapferreira)  
**LinkedIn:** [Michel Ferreira](https://www.linkedin.com/in/michelapferreira/)

## 📋 Pré-requisitos

### 1. Ferramentas Necessárias
```bash
# AWS CLI
aws --version

# kubectl
kubectl version --client

# eksctl (opcional, para criar cluster)
eksctl version
```

### 2. Cluster EKS Configurado
```bash
# Criar cluster EKS (se não existir)
eksctl create cluster \
  --name=eks-cluster \
  --version=1.29 \
  --region=us-east-1 \
  --nodegroup-name=eks-cluster-nodegroup \
  --node-type=t3.medium \
  --nodes=2 \
  --nodes-min=1 \
  --nodes-max=3 \
  --managed

# Configurar kubectl
aws eks --region us-east-1 update-kubeconfig --name eks-cluster
kubectl config current-context
```

## 🏗️ Arquitetura

```
Internet → nginx-ingress → Salon Booking Service → Salon Booking Pods
                                    ↓
                              PostgreSQL Service → PostgreSQL Pod
```

### Componentes
- **nginx-ingress-controller**: Roteamento HTTP/HTTPS externo
- **cert-manager**: Gerenciamento automático de certificados TLS
- **Salon Booking**: Aplicação principal (3 réplicas)
- **PostgreSQL**: Banco de dados (1 réplica)

## 📁 Estrutura de Arquivos

```
k8s/
├── manifests/                    # Manifestos da aplicação
│   ├── salon-booking-deployment.yaml    # Deployment da aplicação
│   ├── salon-booking-service.yaml       # Service interno
│   ├── salon-booking-configmap.yaml     # Configurações
│   ├── salon-booking-secrets.yaml       # Dados sensíveis
│   ├── salon-booking-ingress.yaml       # Ingress com TLS
│   ├── postgres-deployment.yaml         # Deployment PostgreSQL
│   ├── postgres-service.yaml            # Service PostgreSQL
│   └── postgres-pvc.yaml                # Armazenamento PostgreSQL
├── cert/                         # Certificados TLS
│   ├── production-issuer.yaml           # Let's Encrypt Produção
│   └── staging-issuer.yaml              # Let's Encrypt Staging
├── deploy.sh                     # Script de deploy automatizado
└── README.md                     # Esta documentação
```

## 🚀 Deploy Automatizado

### Deploy Completo
```bash
cd k8s
./deploy.sh
```

O script irá:
1. ✅ Verificar kubectl e cluster
2. 📦 Instalar nginx-ingress-controller (se necessário)
3. 🔐 Instalar cert-manager (se necessário)
4. 🚀 Aplicar todos os manifestos
5. ⏳ Aguardar recursos ficarem prontos
6. 📊 Mostrar status do deploy

### Deploy Manual (passo a passo)

#### 1. Instalar nginx-ingress-controller
```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/aws/deploy.yaml

# Aguardar ficar pronto
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=300s
```

#### 2. Instalar cert-manager
```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.18.2/cert-manager.yaml

# Aguardar ficar pronto
kubectl wait --namespace cert-manager \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=300s
```

#### 3. Configurar ClusterIssuers
```bash
kubectl apply -f cert/production-issuer.yaml
kubectl apply -f cert/staging-issuer.yaml
```

#### 4. Deploy da Aplicação
```bash
# Configurações e secrets
kubectl apply -f manifests/salon-booking-configmap.yaml
kubectl apply -f manifests/salon-booking-secrets.yaml

# PostgreSQL
kubectl apply -f manifests/postgres-pvc.yaml
kubectl apply -f manifests/postgres-deployment.yaml
kubectl apply -f manifests/postgres-service.yaml

# Aplicação principal
kubectl apply -f manifests/salon-booking-deployment.yaml
kubectl apply -f manifests/salon-booking-service.yaml

# Ingress
kubectl apply -f manifests/salon-booking-ingress.yaml
```

## 🔧 Configurações

### Domínio
**⚠️ IMPORTANTE:** Altere o domínio nos arquivos:
- `manifests/salon-booking-ingress.yaml`
- `cert/production-issuer.yaml`
- `cert/staging-issuer.yaml`

Substitua `salon-booking.mafinfo.com.br` pelo seu domínio.

### Email do Let's Encrypt
**⚠️ IMPORTANTE:** Altere o email nos arquivos:
- `cert/production-issuer.yaml`
- `cert/staging-issuer.yaml`

Substitua `mi.apferreira@gmail.com` pelo seu email.

### Credenciais do Banco
As credenciais estão em `manifests/salon-booking-secrets.yaml` (base64):
- **Usuário:** `salon_user`
- **Senha:** `salon_password`

Para alterar:
```bash
# Gerar novo valor base64
echo -n "novo_usuario" | base64
echo -n "nova_senha" | base64

# Editar o arquivo secrets.yaml
vim manifests/salon-booking-secrets.yaml
```

## 🌐 Configuração de DNS

### 1. Obter Hostname do Load Balancer
```bash
kubectl get svc -n ingress-nginx ingress-nginx-controller -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

### 2. Configurar DNS
Criar registro CNAME no seu provedor de DNS:
```
CNAME salon-booking.seudominio.com → <hostname-do-lb>
```

### 3. Testar
```bash
# Testar via curl
curl -H "Host: salon-booking.seudominio.com" http://<hostname-do-lb>

# Testar no navegador
# https://salon-booking.seudominio.com
```

## 📊 Monitoramento

### Verificar Status
```bash
# Pods
kubectl get pods -o wide

# Services
kubectl get svc

# Ingress
kubectl get ingress

# Certificados
kubectl get certificate

# Secrets
kubectl get secrets
```

### Logs
```bash
# Logs da aplicação
kubectl logs -l app=salon-booking

# Logs do PostgreSQL
kubectl logs -l app=postgres

# Logs do nginx-ingress
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller

# Logs do cert-manager
kubectl logs -n cert-manager deployment/cert-manager
```

### Descrever Recursos
```bash
# Detalhes do Ingress
kubectl describe ingress salon-booking-ingress

# Detalhes dos certificados
kubectl describe certificate salon-booking-tls-secret

# Detalhes dos pods
kubectl describe pod -l app=salon-booking
```

## 🔍 Troubleshooting

### Problemas Comuns

#### 1. Ingress não funciona
```bash
# Verificar se controller está rodando
kubectl get pods -n ingress-nginx

# Verificar logs do controller
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller

# Verificar se Ingress foi criado
kubectl get ingress
kubectl describe ingress salon-booking-ingress
```

#### 2. Certificado não é emitido
```bash
# Verificar ClusterIssuer
kubectl get clusterissuer
kubectl describe clusterissuer letsencrypt-production

# Verificar challenges
kubectl get challenges

# Verificar orders
kubectl get orders

# Logs do cert-manager
kubectl logs -n cert-manager deployment/cert-manager
```

#### 3. Aplicação não responde
```bash
# Verificar pods da aplicação
kubectl get pods -l app=salon-booking
kubectl describe pod -l app=salon-booking

# Verificar Service
kubectl get svc salon-booking-service
kubectl describe svc salon-booking-service

# Testar Service diretamente
kubectl port-forward svc/salon-booking-service 8080:80
curl http://localhost:8080/api/health
```

#### 4. Banco de dados não conecta
```bash
# Verificar PostgreSQL
kubectl get pods -l app=postgres
kubectl logs -l app=postgres

# Verificar Service do PostgreSQL
kubectl get svc postgres-service

# Testar conexão
kubectl exec -it deployment/postgres -- psql -U salon_user -d salon_booking
```

## 🔄 Atualizações

### Atualizar Aplicação
```bash
# Buildar nova imagem
docker build -t miapferreira/salon-booking:v1.1.0 .
docker push miapferreira/salon-booking:v1.1.0

# Atualizar deployment
kubectl set image deployment/salon-booking salon-booking=miapferreira/salon-booking:v1.1.0

# Verificar rollout
kubectl rollout status deployment/salon-booking
```

### Rollback
```bash
# Ver histórico de rollouts
kubectl rollout history deployment/salon-booking

# Fazer rollback
kubectl rollout undo deployment/salon-booking

# Rollback para versão específica
kubectl rollout undo deployment/salon-booking --to-revision=2
```

## 🧹 Limpeza

### Remover Aplicação
```bash
# Remover manifestos
kubectl delete -f manifests/
kubectl delete -f cert/

# Remover PVC (cuidado - apaga dados!)
kubectl delete pvc postgres-pvc
```

### Remover Cluster
```bash
# Se criado com eksctl
eksctl delete cluster --name eks-cluster --region us-east-1
```

## 📚 Recursos Adicionais

- [nginx-ingress Documentation](https://kubernetes.github.io/ingress-nginx/)
- [cert-manager Documentation](https://cert-manager.io/docs/)
- [Amazon EKS Documentation](https://docs.aws.amazon.com/eks/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)

## 🎯 Próximos Passos

- [ ] Configurar monitoring com Prometheus/Grafana
- [ ] Implementar backup automático do PostgreSQL
- [ ] Configurar auto-scaling horizontal
- [ ] Implementar CI/CD com GitHub Actions
- [ ] Configurar logging centralizado
- [ ] Implementar health checks avançados

---

**Desenvolvido com ❤️ por Michel Ferreira**
