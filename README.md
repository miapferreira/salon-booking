# 💇‍♀️ Salon Booking - Sistema de Agendamento

Sistema completo de agendamento desenvolvido como **microserviço** usando Docker, Node.js, PostgreSQL e Nginx.

**Desenvolvido por:** Michel Ferreira - SRE/DevOps Engineer  
**Email:** mi.apferreira@gmail.com  
**GitHub:** [@miapferreira](https://github.com/miapferreira)  
**LinkedIn:** [Michel Ferreira](https://www.linkedin.com/in/michelapferreira/)

## 🏗️ **Arquitetura do Sistema**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Nginx)       │───▶│   (Node.js)     │───▶│   (PostgreSQL)  │
│   Porta 80      │    │   Porta 3001    │    │   Porta 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 **Estrutura do Projeto**

```
salon-booking/
├── frontend/              # Interface do usuário
│   ├── index.html        # Página principal
│   ├── style.css         # Estilos CSS
│   └── script.js         # JavaScript (cliente)
├── backend/              # API REST
│   ├── server.js         # Servidor Node.js
│   └── package.json      # Dependências Node.js
├── database/             # Scripts de banco
│   └── init.sql          # Inicialização PostgreSQL
├── Dockerfile            # Imagem do backend
├── docker-compose.yml    # Orquestração de containers
├── nginx.conf           # Configuração Nginx
└── README.md            # Este arquivo
```

## 🚀 **Como Executar**

### **Pré-requisitos:**
- Docker instalado
- Docker Compose instalado

### **Comandos:**

1. **Construir e executar todos os serviços:**
```bash
docker-compose up --build
```

2. **Executar em background:**
```bash
docker-compose up -d --build
```

3. **Parar todos os serviços:**
```bash
docker-compose down
```

4. **Ver logs:**
```bash
docker-compose logs -f
```

### **Acessar o Sistema:**
- **Frontend:** http://localhost:80
- **API:** http://localhost:3001/api
- **Banco de dados:** localhost:5432

## 🔧 **Serviços do Sistema**

### **1. Frontend (Nginx)**
- **Função:** Serve arquivos estáticos (HTML, CSS, JS)
- **Porta:** 80
- **Container:** salon-frontend

### **2. Backend (Node.js)**
- **Função:** API REST para gerenciar agendamentos
- **Porta:** 3001
- **Container:** salon-backend
- **Endpoints:**
  - `GET /api/health` - Status do servidor
  - `GET /api/agendamentos` - Lista todos os agendamentos
  - `POST /api/agendamentos` - Cria novo agendamento
  - `GET /api/agendamentos/:data` - Agendamentos por data
  - `DELETE /api/agendamentos/:id` - Remove agendamento

### **3. Database (PostgreSQL)**
- **Função:** Armazena dados dos agendamentos
- **Porta:** 5432
- **Container:** salon-database
- **Credenciais:**
  - Database: salon_booking
  - User: postgres
  - Password: password123

## 📊 **Tabela do Banco**

```sql
CREATE TABLE agendamentos (
    id SERIAL PRIMARY KEY,
    nome_cliente VARCHAR(100) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    data DATE NOT NULL,
    horario TIME NOT NULL,
    servico VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🛠️ **Desenvolvimento**

### **Modo Desenvolvimento:**
```bash
# Backend com hot reload
cd backend
npm install
npm run dev

# Frontend (servir arquivos estáticos)
cd frontend
# Abrir index.html no navegador
```

### **Variáveis de Ambiente:**
Crie um arquivo `.env` na raiz:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=salon_booking
DB_USER=postgres
DB_PASSWORD=password123
NODE_ENV=development
```

## 🏗️ **Build da Imagem Docker**

### **Pré-requisitos:**
```bash
# 1. Docker Desktop rodando
docker info

# 2. Login no Docker Hub
docker login
```

### **Comandos Manuais:**

#### **1. Build da Imagem**
```bash
# Buildar imagem para arquitetura AMD64 (compatível com EKS)
docker build --platform linux/amd64 -t miapferreira/salon-booking:v1.0.0 .

# Buildar também a tag latest
docker build --platform linux/amd64 -t miapferreira/salon-booking:latest .
```

#### **2. Verificar a Imagem**
```bash
# Verificar se a imagem foi criada
docker images | grep salon-booking

# Verificar arquitetura da imagem
docker inspect miapferreira/salon-booking:latest | grep Architecture
# Deve mostrar: "Architecture": "amd64"
```

#### **3. Testar Localmente**
```bash
# Rodar a imagem localmente (via emulação no Mac)
docker run -p 3001:3001 miapferreira/salon-booking:latest

# Testar se está funcionando
curl http://localhost:3001/api/health
```

#### **4. Enviar para Docker Hub**
```bash
# Push da versão específica
docker push miapferreira/salon-booking:v1.0.0

# Push da tag latest
docker push miapferreira/salon-booking:latest
```

#### **5. Deploy no EKS**
```bash
# Reiniciar deployment para usar nova imagem
kubectl rollout restart deployment/salon-booking

# Verificar status
kubectl get pods -l app=salon-booking
kubectl logs -l app=salon-booking
```

### **Comandos Úteis para Debug:**

```bash
# Ver histórico de builds
docker history miapferreira/salon-booking:latest

# Entrar na imagem para debug
docker run -it --entrypoint sh miapferreira/salon-booking:latest

# Verificar tamanho da imagem
docker images miapferreira/salon-booking --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

# Limpar imagens antigas
docker image prune -f
```

### **Script Automatizado:**
```bash
# Para builds rápidos, use o script
./build-simple.sh v1.0.0
```

## 🧪 **Testando a API**

### **Base URL:**
```
http://localhost:3001/api
```

### **1. Health Check**
```bash
curl http://localhost:3001/api/health
```
**Resposta esperada:**
```json
{
  "status": "OK",
  "message": "Servidor funcionando!",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### **2. Listar Todos os Agendamentos**
```bash
curl http://localhost:3001/api/agendamentos
```

### **3. Buscar Agendamentos por Data**
```bash
curl http://localhost:3001/api/agendamentos/2024-01-20
```

### **4. Criar Novo Agendamento**
```bash
curl -X POST http://localhost:3001/api/agendamentos \
  -H "Content-Type: application/json" \
  -d '{
    "nomeCliente": "Maria Silva",
    "telefone": "11999999999",
    "data": "2024-01-25",
    "horario": "14:00",
    "servico": "Corte de cabelo"
  }'
```

### **5. Remover Agendamento**
```bash
curl -X DELETE http://localhost:3001/api/agendamentos/1
```

### **📊 Resumo dos Endpoints:**

| **Método** | **Endpoint** | **Descrição** |
|------------|-------------|---------------|
| `GET` | `/api/health` | Status do servidor |
| `GET` | `/api/agendamentos` | Lista todos os agendamentos |
| `GET` | `/api/agendamentos/{data}` | Lista por data específica |
| `POST` | `/api/agendamentos` | Cria novo agendamento |
| `DELETE` | `/api/agendamentos/{id}` | Remove agendamento |

## 🐳 **Comandos Docker Úteis**

```bash
# Ver containers rodando
docker ps

# Entrar no container do backend
docker exec -it salon-backend sh

# Ver logs de um serviço específico
docker-compose logs backend

# Reconstruir apenas um serviço
docker-compose up --build backend

# Parar e remover volumes (CUIDADO: apaga dados)
docker-compose down -v
```


## 📈 **Próximos Passos**

- [ ] Adicionar autenticação
- [ ] Implementar cache Redis
- [ ] Adicionar testes automatizados
- [ ] Configurar CI/CD
- [ ] Adicionar monitoramento
- [ ] Implementar backup automático

## 🆘 **Solução de Problemas**

### **Erro: Porta já em uso**
```bash
# Verificar o que está usando a porta
lsof -i :80
lsof -i :3001
lsof -i :5432

# Parar serviços conflitantes
docker-compose down
```

### **Erro: Banco não conecta**
```bash
# Verificar se PostgreSQL está rodando
docker-compose logs database

# Reiniciar apenas o banco
docker-compose restart database
```

### **Erro: Frontend não carrega**
```bash
# Verificar se Nginx está servindo arquivos
docker-compose logs frontend

# Verificar arquivos do frontend
docker exec -it salon-frontend ls -la /usr/share/nginx/html
```

## 📝 **Logs e Debug**

```bash
# Ver todos os logs
docker-compose logs

# Logs em tempo real
docker-compose logs -f

# Logs de um serviço específico
docker-compose logs -f backend
docker-compose logs -f database
docker-compose logs -f frontend
```

---

**Desenvolvido como exemplo de microserviço com Docker** 🐳

